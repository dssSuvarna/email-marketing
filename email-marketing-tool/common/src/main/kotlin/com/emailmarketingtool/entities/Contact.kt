package com.emailmarketingtool.entities

import jakarta.persistence.*

@Entity
data class Contact(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var name: String,
    var email: String,
    var company: String,
    @Column(name = "group_name")
    var group: String
)
