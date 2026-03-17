package com.investment.userservice.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class UserResponse {

    private final UUID id;
    private final String login;
    private final String email;
    private final boolean isActive;
    private final LocalDateTime createdAt;
    private final List<String> roles;

    public UserResponse(UUID id, String login, String email, boolean isActive, LocalDateTime createdAt, List<String> roles) {
        this.id = id;
        this.login = login;
        this.email = email;
        this.isActive = isActive;
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
        return isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<String> getRoles() {
        return roles;
    }
}
