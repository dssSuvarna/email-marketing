package com.emailmarketingtool.services

import com.emailmarketingtool.configs.JwtService
import com.emailmarketingtool.entities.Campaign
import com.emailmarketingtool.entities.Contact
import com.emailmarketingtool.entities.Sender
import com.emailmarketingtool.enums.CampaignStatus
import com.emailmarketingtool.enums.Role
import com.emailmarketingtool.errors.ErrorMessages
import com.emailmarketingtool.models.requests.CreateCampaignRequest
import com.emailmarketingtool.models.requests.CreateContactRequest
import com.emailmarketingtool.models.requests.UpdateCampaignRequest
import com.emailmarketingtool.models.responses.CampaignsResponse
import com.emailmarketingtool.models.responses.ContactResponse
import com.emailmarketingtool.models.responses.SenderResponse
import com.emailmarketingtool.models.responses.TemplateResponse
import com.emailmarketingtool.repositories.*
import jakarta.persistence.EntityNotFoundException
import jakarta.ws.rs.NotAllowedException
import org.jobrunr.scheduling.JobScheduler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

@Service
class CampaignService @Autowired constructor(
    private val campaignRepository: CampaignRepository,
    private val senderRepository: SenderRepository,
    private val userRepository: UserRepository,
    private val templateRepository: TemplateRepository,
    private val jobScheduler: JobScheduler,
    private val campaignProcessingService: CampaignProcessingService,
    private val authUserRepository: AuthUserRepository,
    private val contactRepository: ContactRepository,
    private val notificationRepository: NotificationRepository,
) {
    @Transactional
    fun createCampaign(createCampaignRequest: CreateCampaignRequest, token: String, csvFile: MultipartFile): String {
        val authUser = authUserRepository.findByUsername(JwtService.extractUsername(token)) ?: throw UsernameNotFoundException(
            ErrorMessages.AUTH_USER_NOT_FOUND)
        val user = userRepository.findUserByAuthUser(authUser.username) ?: throw UsernameNotFoundException(
            ErrorMessages.USER_NOT_FOUND)
        val senders: MutableList<Sender> = mutableListOf()
        if(createCampaignRequest.senders.isEmpty()) throw NotAllowedException("senders can not be empty")
        createCampaignRequest.senders.forEach { senderId ->
            val senderOptional = senderRepository.findById(senderId)
            if (senderOptional.isPresent) {
                senders.add(senderOptional.get())
            } else {
                throw EntityNotFoundException("Sender with ID $senderId not found")
            }
        }
        if (authUser.role.name.name == Role.USER.toString() ){
            val userSenders = senderRepository.findSenderByUserId(user.id)
            if(!userSenders.map { it.id }.containsAll(createCampaignRequest.senders)) throw EntityNotFoundException(ErrorMessages.SENDER_NOT_ASSOCIATED_WITH_USER)
        }
        if (createCampaignRequest.scheduleTime.isAfter(createCampaignRequest.endTime)){
            throw IllegalArgumentException("schedule time should not be greater than end time")
        }
        val templates = templateRepository.findAllById(createCampaignRequest.templateIds)
        if(!templates.map { it.id }.containsAll(createCampaignRequest.templateIds)) throw EntityNotFoundException("Templates not found")

        val contactLists : MutableList<Contact> = mutableListOf()
        val contactIds: MutableList<Long> = mutableListOf()

        if (!csvFile.isEmpty) {
            val contacts = validateCsvFile(csvFile)
            contactLists.addAll(validateContactsInDb(contacts))
            contactIds.addAll(contactLists.map { it.id })
        }
        if (createCampaignRequest.groupNames?.isEmpty() == false){
            val existingContacts = contactRepository.findByGroupIn(createCampaignRequest.groupNames)
                .filter { !contactIds.contains(it.id) }
            contactLists.addAll(existingContacts)
        }

        val campaign = campaignRepository.save(
            Campaign(
                name = createCampaignRequest.name,
                description = createCampaignRequest.description,
                status = CampaignStatus.CREATED,
                scheduleTime = createCampaignRequest.scheduleTime,
                endTime = createCampaignRequest.endTime,
                templates = templates,
                contacts = contactLists,
                createdBy = user.id,
                campaignSenders = senders
            )
        )
        templates.forEach { it.campaignId = campaign.id }
        templateRepository.saveAll(templates)
        campaign.status = CampaignStatus.SCHEDULED
        jobScheduler.schedule(campaign.scheduleTime) {
            campaignProcessingService.processCampaign(campaign)
        }
        return "Created and Scheduled"
    }

    @Transactional
    fun updateCampaign(updateCampaignRequest: UpdateCampaignRequest): Campaign {
        val existingCampaign: Campaign = campaignRepository.findById(updateCampaignRequest.campaignId)
            .orElseThrow { EntityNotFoundException("Campaign not found") }
        if ((updateCampaignRequest.scheduleTime != null && updateCampaignRequest.endTime != null) && updateCampaignRequest.scheduleTime!!.isAfter(
                updateCampaignRequest.endTime
            )){
            throw IllegalArgumentException("schedule time should not be greater than end time")
        }
        existingCampaign.name = updateCampaignRequest.name ?:existingCampaign.name
        existingCampaign.description = updateCampaignRequest.description ?: existingCampaign.description
        existingCampaign.scheduleTime = updateCampaignRequest.scheduleTime ?: existingCampaign.scheduleTime
        existingCampaign.endTime = updateCampaignRequest.endTime ?: existingCampaign.endTime
        existingCampaign.templates = updateCampaignRequest.templates ?: existingCampaign.templates
        existingCampaign.contacts = updateCampaignRequest.contacts ?: existingCampaign.contacts
        existingCampaign.campaignSenders = updateCampaignRequest.senders ?: existingCampaign.campaignSenders
        existingCampaign.status = if(updateCampaignRequest.status != CampaignStatus.DISCARDED)
            throw NotAllowedException("Can only discard") else  CampaignStatus.DISCARDED
        return campaignRepository.save(existingCampaign)
    }

    private fun validateCsvFile(csvFile: MultipartFile): MutableList<Contact> {
        val contacts = mutableListOf<Contact>()

        csvFile.inputStream.bufferedReader().useLines { lines ->
            var headerProcessed = false
            var nameIndex = 0
            var emailIndex = 0
            var companyIndex = 0
            var groupIndex = 0

            lines.forEachIndexed { index, line ->
                val lineNumber = index + 1 // Line number starts from 1
                val columns = line.split(",").map { it.trim() }

                if (columns.isNotEmpty() && columns.any { it.isNotBlank() }) {
                    // Check if the header has been processed
                    if (!headerProcessed) {
                        if (!columns.containsAll(listOf("name", "email", "company","group"))) {
                            throw IllegalArgumentException("Header fields (name, email, company, group) are missing in the CSV file.")
                        }
                        nameIndex = columns.indexOf("name")
                        emailIndex = columns.indexOf("email")
                        companyIndex = columns.indexOf("company")
                        groupIndex = columns.indexOf("group")
                        headerProcessed = true
                    } else {
                        // Process non-empty lines
                        val name = columns.getOrNull(nameIndex) ?: ""
                        val email = columns.getOrNull(emailIndex) ?: ""
                        val company = columns.getOrNull(companyIndex) ?: ""
                        val group = columns.getOrNull(groupIndex) ?: ""

                        val contactRequest = CreateContactRequest(name = name, email = email, company = company, group = group)
                        val contact = Contact(name = contactRequest.name, email = contactRequest.email, company = contactRequest.company, group = contactRequest.group)
                        if (contacts.any { it.email == email }) {
                            throw IllegalArgumentException("Duplicate email found in the CSV file: $email. Error at line $lineNumber")
                        }
                        contacts.add(contact)
                    }
                }
            }
            if (!headerProcessed) {
                throw IllegalArgumentException("The CSV file does not contain the required header fields (name, email, company, group).")
            }
        }

        if (contacts.isEmpty()) {
            throw IllegalArgumentException("The CSV file must contain at least one contact")
        }
        return contacts
    }

    private fun validateContactsInDb(contacts: List<Contact>): MutableList<Contact> {
        val emailToContactMap: Map<String, Contact> = contacts
            .associateBy(Contact::email)
        val existingContacts = contactRepository.findByEmailIn(emailToContactMap.keys.toList())

        if (existingContacts.isNotEmpty()){
            existingContacts.forEach{
                contact ->
                val currentContact = emailToContactMap[contact.email]
                contact.name = currentContact?.name?:contact.name
                contact.email = currentContact?.email?:contact.email
                contact.company = currentContact?.company?:contact.company
            }
        }
        if (existingContacts.isEmpty()){
            contactRepository.saveAll(contacts)
        }
        if (existingContacts.isNotEmpty() && existingContacts.size != contacts.size){
            val nonExistingContacts = contacts.filter { contact ->
                existingContacts.none { existingContact ->
                    existingContact.email == contact.email
                }
            }
            if (nonExistingContacts.isNotEmpty()){
                contactRepository.saveAll(contacts)
            }
        }

        return contactRepository.findByEmailIn(emailToContactMap.keys.toList())
    }

    fun getCampaign(token: String, id: Long): CampaignsResponse {
        val authUser = authUserRepository.findByUsername(JwtService.extractUsername(token)) ?: throw UsernameNotFoundException(
            ErrorMessages.AUTH_USER_NOT_FOUND)
        val user = userRepository.findUserByAuthUser(authUser.username)?: throw UsernameNotFoundException(ErrorMessages.USER_NOT_FOUND)

        val campaign = campaignRepository.findById(id).orElseThrow{EntityNotFoundException("Campaign not found")}
        if (authUser.role.name.name == Role.USER.toString() && campaign.createdBy != user.id){
            throw IllegalArgumentException("Campaign is not belongs to this user")
        }
        val template = campaign.templates[0]
        val contacts = campaign.contacts
        val sender = campaign.campaignSenders[0]
        return  CampaignsResponse(
                id = campaign.id,
                name = campaign.name,
                description = campaign.description,
                schedule_time = campaign.scheduleTime ?: LocalDateTime.MIN,
                end_time = campaign.endTime ?: LocalDateTime.MIN,
                status = campaign.status,
                template = TemplateResponse(
                    id = template.id,
                    name = template.name,
                    content = template.content
                ),
                contacts = contacts.map { contact -> ContactResponse(
                    id = contact.id,
                    name = contact.name,
                    email =  contact.email,
                    company =  contact.company,
                    group = contact.group
                ) },
                sender = SenderResponse(
                    senderId = sender.id,
                    mail = sender.mail,
                    port = sender.port,
                    host = sender.host,
                    signatures = sender.signatures,
                    userId = sender.userId
                ))
    }
    fun getAllCampaigns(token: String): List<CampaignsResponse> {
        val authUser = authUserRepository.findByUsername(JwtService.extractUsername(token)) ?: throw UsernameNotFoundException(
            ErrorMessages.AUTH_USER_NOT_FOUND)
        val user = userRepository.findUserByAuthUser(authUser.username) ?: throw UsernameNotFoundException(ErrorMessages.USER_NOT_FOUND)

        val campaigns = if (authUser.role.name.name == Role.USER.toString()) {
            campaignRepository.findAllByCreatedBy(user.id)
        } else {
            campaignRepository.findAll()
        }
            return campaigns.map {
                val template = it.templates[0]
                val contacts = it.contacts
                val sender = it.campaignSenders[0]
                CampaignsResponse(
                    id = it.id,
                    name = it.name,
                    description = it.description,
                    schedule_time = it.scheduleTime ?: LocalDateTime.MIN,
                    end_time = it.endTime ?: LocalDateTime.MIN,
                    status = it.status,
                    template = TemplateResponse(
                        id = template.id,
                        name = template.name,
                        content = template.content
                    ),
                    contacts = contacts.map { contact -> ContactResponse(
                        id = contact.id,
                        name = contact.name,
                        email =  contact.email,
                        company =  contact.company,
                        group = contact.group
                    ) },
                    sender = SenderResponse(
                        senderId = sender.id,
                        mail = sender.mail,
                        port = sender.port,
                        host = sender.host,
                        signatures = sender.signatures,
                        userId = sender.userId
                    ))}
    }

    fun deleteCampaign(token: String, id: Long): String {
        val campaign = campaignRepository.findById(id).orElseThrow{EntityNotFoundException("Campaign not found")}
        val authUser = authUserRepository.findByUsername(JwtService.extractUsername(token)) ?: throw UsernameNotFoundException(
            ErrorMessages.AUTH_USER_NOT_FOUND)
        val user = userRepository.findUserByAuthUser(authUser.username) ?: throw UsernameNotFoundException(
            ErrorMessages.AUTH_USER_NOT_FOUND)

        if (authUser.role.name.name == Role.USER.toString() && campaign.createdBy != user.id){
            throw IllegalArgumentException("Campaign is not belongs to this user")
        }
        val notifications = notificationRepository.findByCampaignId(campaign.id)
        notificationRepository.deleteAll(notifications)
        campaignRepository.delete(campaign)
        return "Deleted"
    }
}
