package com.investment.userservice.exception;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String error;
    private final Map<String, String> details;

    public ApiException(HttpStatus status, String message, String error) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = null;
    }

    public ApiException(HttpStatus status, String message, String error, Map<String, String> details) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = details;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public Map<String, String> getDetails() {
        return details;
    }
}
