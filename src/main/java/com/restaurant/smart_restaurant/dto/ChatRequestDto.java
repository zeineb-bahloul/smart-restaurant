package com.restaurant.smart_restaurant.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequestDto {

    @NotBlank(message = "Le message ne peut pas être vide")
    private String message;

    public ChatRequestDto() {
    }

    public ChatRequestDto(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
