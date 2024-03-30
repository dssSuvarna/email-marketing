package com.emailmarketingtool.services

import org.springframework.mail.MailException
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class EmailService {
    fun sendEmail(mailSender: JavaMailSender, emailRequest: EmailRequest) {
        try {
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true)

            helper.setSubject(emailRequest.subject)
            helper.setTo(emailRequest.email)
            helper.setText(emailRequest.body, true)
            mailSender.send(message)
        } catch (e: MailException) {
            println("Failed to send email: ${e.message}")
        } catch (e: Exception) {
            println("Failed to send email: ${e.message}")
        }
    }
}

data class EmailRequest(
    val subject: String,
    val body: String,
    val email: String
)