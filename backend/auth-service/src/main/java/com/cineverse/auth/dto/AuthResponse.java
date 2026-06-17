package com.cineverse.auth.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long id;

    public AuthResponse(String token, String email, String role, Long id) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.id = id;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
