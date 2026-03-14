package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.common.PageResponseDTO;
import com.akshat.ecommerce.DTO.order.OrderRequestDTO;
import com.akshat.ecommerce.DTO.order.OrderResponseDTO;
import com.akshat.ecommerce.Service.OrderService;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ========================
    //    USER ENDPOINTS
    // ========================

    /**
     * Place a new order from cart
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> createOrder(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody OrderRequestDTO request) {

        OrderResponseDTO order = orderService.createOrder(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Order placed successfully", order));
    }

    /**
     * Get current user's orders
     * GET /api/orders/my?page=0&size=10
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponseDTO<List<OrderResponseDTO>>> getMyOrders(
            @CurrentUser UserPrincipal userPrincipal) {

        List<OrderResponseDTO> orders = orderService.getUserOrders(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(orders));
    }

    /**
     * Get a specific order by ID (user can only see their own orders)
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> getOrderById(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long id) {

        OrderResponseDTO order = orderService.getOrderByIdForUser(id, userPrincipal.getId(), isAdmin(userPrincipal));
        return ResponseEntity.ok(ApiResponseDTO.success(order));
    }

    /**
     * Track order by order number (public — just need the order number)
     * GET /api/orders/track/{orderNumber}
     */
    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> trackOrder(
            @PathVariable String orderNumber) {

        OrderResponseDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponseDTO.success(order));
    }

    /**
     * Cancel an order (user can cancel only their own PENDING orders)
     * PATCH /api/orders/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> cancelOrder(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long id) {

        OrderResponseDTO order = orderService.cancelOrder(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success("Order cancelled successfully", order));
    }

    // ========================
    //    ADMIN ENDPOINTS
    // ========================

    /**
     * Get all orders with pagination (ADMIN only)
     * GET /api/orders?page=0&size=10&status=PENDING
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<PageResponseDTO<OrderResponseDTO>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        PageResponseDTO<OrderResponseDTO> orders = orderService.getAllOrders(page, size, status);
        return ResponseEntity.ok(ApiResponseDTO.success(orders));
    }

    /**
     * Update order status (ADMIN only)
     * PATCH /api/orders/{id}/status?status=SHIPPED
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        OrderResponseDTO order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponseDTO.success("Order status updated", order));
    }

    /**
     * Update payment status (ADMIN only)
     * PATCH /api/orders/{id}/payment-status?status=PAID
     */
    @PatchMapping("/{id}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        OrderResponseDTO order = orderService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(ApiResponseDTO.success("Payment status updated", order));
    }

    /**
     * Update shipping status (ADMIN only)
     * PATCH /api/orders/{id}/shipping-status?status=SHIPPED
     */
    @PatchMapping("/{id}/shipping-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<OrderResponseDTO>> updateShippingStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        OrderResponseDTO order = orderService.updateShippingStatus(id, status);
        return ResponseEntity.ok(ApiResponseDTO.success("Shipping status updated", order));
    }

    /**
     * Get orders by user ID (ADMIN only)
     * GET /api/orders/user/{userId}
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<List<OrderResponseDTO>>> getOrdersByUser(
            @PathVariable Long userId) {

        List<OrderResponseDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponseDTO.success(orders));
    }

    private boolean isAdmin(UserPrincipal userPrincipal) {
        return userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
