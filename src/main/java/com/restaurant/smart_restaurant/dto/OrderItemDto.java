package com.restaurant.smart_restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OrderItemDto {

    @NotNull(message = "L'ID du plat est obligatoire")
    private Long menuItemId;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être d'au moins 1")
    private Integer quantity;

    public OrderItemDto() {
    }

    public OrderItemDto(Long menuItemId, Integer quantity) {
        this.menuItemId = menuItemId;
        this.quantity = quantity;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
