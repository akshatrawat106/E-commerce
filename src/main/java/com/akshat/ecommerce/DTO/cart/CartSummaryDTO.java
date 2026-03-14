package com.akshat.ecommerce.DTO.cart;

import java.math.BigDecimal;
import java.util.List;

public class CartSummaryDTO {

    private List<CartItemResponseDTO> items;
    private Integer totalItems;
    private BigDecimal subtotal;

    // Getters and Setters
    public List<CartItemResponseDTO> getItems() { return items; }
    public void setItems(List<CartItemResponseDTO> items) { this.items = items; }

    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
}