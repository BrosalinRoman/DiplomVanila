package com.investment.userservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserTableRow {

    private final UUID id;
    private final String login;
    private final String email;
    private final boolean active;
    private final LocalDateTime createdAt;
    private final String roles;

    public UserTableRow(UUID id, String login, String email, boolean active, LocalDateTime createdAt, String roles) {
        this.id = id;
        this.login = login;
        this.email = email;
        this.active = active;
        this.createdAt = createdAt;
        this.roles = roles;
    }

    public UUID getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public String getEmail() {
        return email;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getRoles() {
        return roles;
    }
}
