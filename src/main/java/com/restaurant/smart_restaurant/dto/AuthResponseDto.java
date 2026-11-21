package com.restaurant.smart_restaurant.dto;

import com.restaurant.smart_restaurant.model.Role;
import java.util.UUID;

public class AuthResponseDto {
    private String token;
    private UUID id;
    private String name;
    private String email;
    private Role role;

    public AuthResponseDto() {
    }

    public AuthResponseDto(String token, UUID id, String name, String email, Role role) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    
    public static AuthResponseDtoBuilder builder() {
        return new AuthResponseDtoBuilder();
    }

    public static class AuthResponseDtoBuilder {
        private String token;
        private UUID id;
        private String name;
        private String email;
        private Role role;

        AuthResponseDtoBuilder() {}

        public AuthResponseDtoBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthResponseDtoBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public AuthResponseDtoBuilder name(String name) {
            this.name = name;
            return this;
        }

        public AuthResponseDtoBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthResponseDtoBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public AuthResponseDto build() {
            return new AuthResponseDto(token, id, name, email, role);
        }
    }
}
