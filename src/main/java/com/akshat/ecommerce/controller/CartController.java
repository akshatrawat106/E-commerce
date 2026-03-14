package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.cart.CartItemRequestDTO;
import com.akshat.ecommerce.DTO.cart.CartItemResponseDTO;
import com.akshat.ecommerce.DTO.cart.CartSummaryDTO;
import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.Service.CartService;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Cart endpoints — all use JWT to identify the current user.
 * No userId in URL path (security best practice).
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Add a product to cart
     * POST /api/cart/items
     */
    @PostMapping("/items")
    public ResponseEntity<ApiResponseDTO<CartItemResponseDTO>> addToCart(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody CartItemRequestDTO request) {

        CartItemResponseDTO item = cartService.addToCart(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponseDTO.success("Item added to cart", item));
    }

    /**
     * Get current user's cart
     * GET /api/cart
     */
    @GetMapping
    public ResponseEntity<ApiResponseDTO<CartSummaryDTO>> getCart(
            @CurrentUser UserPrincipal userPrincipal) {

        CartSummaryDTO cart = cartService.getCart(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(cart));
    }

    /**
     * Update quantity of a cart item
     * PATCH /api/cart/items/{cartItemId}?quantity=3
     */
    @PatchMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponseDTO<CartItemResponseDTO>> updateCartItem(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {

        CartItemResponseDTO item = cartService.updateCartItem(userPrincipal.getId(), cartItemId, quantity);
        return ResponseEntity.ok(ApiResponseDTO.success("Cart item updated", item));
    }

    /**
     * Remove a specific item from cart
     * DELETE /api/cart/items/{cartItemId}
     */
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponseDTO<Void>> removeFromCart(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long cartItemId) {

        cartService.removeFromCart(userPrincipal.getId(), cartItemId);
        return ResponseEntity.ok(ApiResponseDTO.success("Item removed from cart", null));
    }

    /**
     * Clear entire cart
     * DELETE /api/cart
     */
    @DeleteMapping
    public ResponseEntity<ApiResponseDTO<Void>> clearCart(
            @CurrentUser UserPrincipal userPrincipal) {

        cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success("Cart cleared", null));
    }
}
