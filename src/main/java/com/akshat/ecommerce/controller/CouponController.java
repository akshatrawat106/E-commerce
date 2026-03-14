package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.coupon.CouponRequestDTO;
import com.akshat.ecommerce.DTO.coupon.CouponResponseDTO;
import com.akshat.ecommerce.Service.CouponService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    /**
     * Validate a coupon code and return discount (authenticated users)
     * GET /api/coupons/validate?code=SAVE10&orderAmount=200.00
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {

        Map<String, Object> result = couponService.validateAndCalculateDiscount(code, orderAmount);
        return ResponseEntity.ok(ApiResponseDTO.success(result));
    }

    // ========================
    //    ADMIN-ONLY ENDPOINTS
    // ========================

    /**
     * Create a coupon (ADMIN only)
     * POST /api/coupons
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<CouponResponseDTO>> createCoupon(
            @Valid @RequestBody CouponRequestDTO request) {

        CouponResponseDTO coupon = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Coupon created", coupon));
    }

    /**
     * Get all coupons (ADMIN only)
     * GET /api/coupons
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<List<CouponResponseDTO>>> getAllCoupons() {
        List<CouponResponseDTO> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponseDTO.success(coupons));
    }

    /**
     * Get coupon by ID (ADMIN only)
     * GET /api/coupons/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<CouponResponseDTO>> getCouponById(
            @PathVariable Long id) {

        CouponResponseDTO coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponseDTO.success(coupon));
    }

    /**
     * Update a coupon (ADMIN only)
     * PUT /api/coupons/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<CouponResponseDTO>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequestDTO request) {

        CouponResponseDTO coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Coupon updated", coupon));
    }

    /**
     * Toggle coupon active/inactive (ADMIN only)
     * PATCH /api/coupons/{id}/status?active=false
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<CouponResponseDTO>> toggleCouponStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        CouponResponseDTO coupon = couponService.setActive(id, active);
        return ResponseEntity.ok(ApiResponseDTO.success(
                active ? "Coupon activated" : "Coupon deactivated", coupon));
    }

    /**
     * Delete a coupon (ADMIN only)
     * DELETE /api/coupons/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponseDTO.success("Coupon deleted", null));
    }
}
