package com.akshat.ecommerce.Service;

import com.akshat.ecommerce.DTO.*;

import com.akshat.ecommerce.DTO.cart.CartItemRequestDTO;
import com.akshat.ecommerce.DTO.cart.CartItemResponseDTO;
import com.akshat.ecommerce.DTO.cart.CartSummaryDTO;
import com.akshat.ecommerce.Entity.CartItem;
import com.akshat.ecommerce.Entity.Product;
import com.akshat.ecommerce.Entity.User;
import com.akshat.ecommerce.Repository.CartItemRepository;
import com.akshat.ecommerce.Repository.ProductRepository;
import com.akshat.ecommerce.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public CartItemResponseDTO addToCart(Long userId, CartItemRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already in cart
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId())
                .orElse(null);

        if (cartItem != null) {
            // Update quantity
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItem.setTotalPrice(product.getPrice().multiply(new BigDecimal(cartItem.getQuantity())));
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUnitPrice(product.getPrice());
            cartItem.setTotalPrice(product.getPrice().multiply(new BigDecimal(request.getQuantity())));
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return mapToResponse(saved);
    }

    @Transactional
    public CartSummaryDTO getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);

        // Filter out orphaned cart items where the product was deleted
        List<CartItem> validItems = items.stream()
                .filter(item -> item.getProduct() != null)
                .collect(Collectors.toList());

        // Auto-clean orphaned items from DB so they don't cause issues again
        List<CartItem> orphanedItems = items.stream()
                .filter(item -> item.getProduct() == null)
                .collect(Collectors.toList());
        if (!orphanedItems.isEmpty()) {
            cartItemRepository.deleteAll(orphanedItems);
        }

        CartSummaryDTO summary = new CartSummaryDTO();
        summary.setItems(validItems.stream().map(this::mapToResponse).collect(Collectors.toList()));
        summary.setTotalItems(validItems.stream().mapToInt(CartItem::getQuantity).sum());
        summary.setSubtotal(validItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return summary;
    }

    @Transactional
    public CartItemResponseDTO updateCartItem(Long userId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Guard against orphaned product
        if (cartItem.getProduct() == null) {
            cartItemRepository.delete(cartItem);
            throw new RuntimeException("Product no longer exists, item removed from cart");
        }

        cartItem.setQuantity(quantity);
        cartItem.setTotalPrice(cartItem.getUnitPrice().multiply(new BigDecimal(quantity)));

        CartItem updated = cartItemRepository.save(cartItem);
        return mapToResponse(updated);
    }

    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartItemResponseDTO mapToResponse(CartItem cartItem) {
        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setId(cartItem.getId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setUnitPrice(cartItem.getUnitPrice());
        dto.setTotalPrice(cartItem.getTotalPrice());

        // Safe null check — product may have been deleted
        Product product = cartItem.getProduct();
        if (product != null) {
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setProductSku(product.getSku());
            dto.setProductImage(product.getImageUrl());
        } else {
            dto.setProductId(null);
            dto.setProductName("Product unavailable");
            dto.setProductSku("N/A");
            dto.setProductImage(null);
        }

        return dto;
    }
}