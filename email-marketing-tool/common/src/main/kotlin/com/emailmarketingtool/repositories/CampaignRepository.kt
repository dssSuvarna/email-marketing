package com.emailmarketingtool.repositories

import com.emailmarketingtool.entities.Campaign
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CampaignRepository : JpaRepository<Campaign, Long> {

    fun findAllByCreatedBy(createdBy: Long): List<Campaign>
}