package com.investment.userservice.dto;

import java.util.List;
import java.util.UUID;

public class AuthResponse {

    private final String token;
    private final UUID userId;
    private final String login;
    private final List<String> roles;

    public AuthResponse(String token, UUID userId, String login, List<String> roles) {
        this.token = token;
        this.userId = userId;
        this.login = login;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getLogin() {
        return login;
    }

    public List<String> getRoles() {
        return roles;
    }
}
