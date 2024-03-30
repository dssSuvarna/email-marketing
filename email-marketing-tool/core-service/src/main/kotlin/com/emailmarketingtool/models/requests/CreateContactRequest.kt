package com.emailmarketingtool.models.requests

import java.util.regex.Pattern


data class CreateContactRequest(
    var name: String,
    var email: String,
    var company: String,
    var group: String
) {
    init {
        require(name.isNotBlank()) { "Name cannot be null" }
        require(email.isNotBlank()) { "Email cannot be null" }
        require(company.isNotBlank()) { "Company cannot be null" }
        require(group.isNotBlank()) { "Group cannot be null" }
        require(isValidEmail(email)) { "Invalid email format" }
    }

    private fun isValidEmail(email: String): Boolean {
        val emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\$"
        val pattern = Pattern.compile(emailRegex, Pattern.CASE_INSENSITIVE)
        return pattern.matcher(email).matches()
    }
}