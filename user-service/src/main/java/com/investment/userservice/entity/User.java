package com.investment.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

    @Entity
    @Table(name = "users")
    @Getter
    @Setter
    public class User {

        @Id
        @GeneratedValue
        private UUID id;

        @Column(unique = true, nullable = false)
        private String login;

        @Column(nullable = false)
        private String passwordHash;

        @Column(unique = true)
        private String email;

        private boolean isActive = true;

        private LocalDateTime createdAt = LocalDateTime.now();

    }