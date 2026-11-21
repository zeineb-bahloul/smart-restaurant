package com.restaurant.smart_restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class OrderRequestDto {

    @NotEmpty(message = "La commande doit contenir au moins un plat")
    @Valid
    private List<OrderItemDto> items;

    private String note;

    public OrderRequestDto() {
    }

    public OrderRequestDto(List<OrderItemDto> items, String note) {
        this.items = items;
        this.note = note;
    }

    public List<OrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDto> items) {
        this.items = items;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
