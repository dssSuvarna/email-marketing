package com.emailmarketingtool.models.responses

data class ContactResponse(
    val id: Long,
    val name: String,
    val email: String,
    val company: String,
    val group: String
)