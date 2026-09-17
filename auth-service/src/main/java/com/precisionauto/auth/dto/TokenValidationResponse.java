package com.precisionauto.auth.dto;

public class TokenValidationResponse {
    private boolean valid;
    private Long userId;
    private String email;
    private String role;
    private String fullName;
    private String organization;
    private String message;

    public TokenValidationResponse() {}

    public TokenValidationResponse(boolean valid, Long userId, String email, String role, String fullName, String organization, String message) {
        this.valid = valid;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.organization = organization;
        this.message = message;
    }

    public static TokenValidationResponse invalid(String message) {
        TokenValidationResponse res = new TokenValidationResponse();
        res.setValid(false);
        res.setMessage(message);
        return res;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
