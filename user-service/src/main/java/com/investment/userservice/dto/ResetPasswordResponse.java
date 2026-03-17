package com.investment.userservice.dto;

import java.util.UUID;

public class ResetPasswordResponse {

    private final UUID userId;
    private final String temporaryPassword;

    public ResetPasswordResponse(UUID userId, String temporaryPassword) {
        this.userId = userId;
        this.temporaryPassword = temporaryPassword;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }
}
