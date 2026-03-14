package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.product.ProductResponseDTO;
import com.akshat.ecommerce.Service.WishlistService;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    /**
     * Get all wishlist items for current user
     * GET /api/wishlist
     */
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<ProductResponseDTO>>> getWishlist(
            @CurrentUser UserPrincipal userPrincipal) {

        List<ProductResponseDTO> products = wishlistService.getWishlist(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(products));
    }

    /**
     * Add product to wishlist
     * POST /api/wishlist/{productId}
     */
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponseDTO<Void>> addToWishlist(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long productId) {

        wishlistService.addToWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponseDTO.success("Added to wishlist", null));
    }

    /**
     * Remove product from wishlist
     * DELETE /api/wishlist/{productId}
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponseDTO<Void>> removeFromWishlist(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long productId) {

        wishlistService.removeFromWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponseDTO.success("Removed from wishlist", null));
    }

    /**
     * Check if a product is in the current user's wishlist
     * GET /api/wishlist/{productId}/check
     */
    @GetMapping("/{productId}/check")
    public ResponseEntity<ApiResponseDTO<Map<String, Boolean>>> checkWishlist(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long productId) {

        boolean isInWishlist = wishlistService.isInWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponseDTO.success(Map.of("inWishlist", isInWishlist)));
    }

    /**
     * Clear entire wishlist
     * DELETE /api/wishlist
     */
    @DeleteMapping
    public ResponseEntity<ApiResponseDTO<Void>> clearWishlist(
            @CurrentUser UserPrincipal userPrincipal) {

        wishlistService.clearWishlist(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success("Wishlist cleared", null));
    }
}
