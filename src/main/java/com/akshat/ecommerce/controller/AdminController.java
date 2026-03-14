package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.admin.AdminDashboardDTO;
import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.product.ProductResponseDTO;
import com.akshat.ecommerce.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Dashboard statistics
     * GET /api/admin/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponseDTO<AdminDashboardDTO>> getDashboard() {
        AdminDashboardDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponseDTO.success(stats));
    }

    /**
     * Get low stock products (quantity < threshold)
     * GET /api/admin/products/low-stock?threshold=10
     */
    @GetMapping("/products/low-stock")
    public ResponseEntity<ApiResponseDTO<List<ProductResponseDTO>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {

        List<ProductResponseDTO> products = adminService.getLowStockProducts(threshold);
        return ResponseEntity.ok(ApiResponseDTO.success(products));
    }

    /**
     * Update product stock
     * PATCH /api/admin/products/{id}/stock?quantity=50
     */
    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> updateProductStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {

        ProductResponseDTO product = adminService.updateProductStock(id, quantity);
        return ResponseEntity.ok(ApiResponseDTO.success("Stock updated", product));
    }

    /**
     * Toggle product featured status
     * PATCH /api/admin/products/{id}/featured?featured=true
     */
    @PatchMapping("/products/{id}/featured")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> toggleFeatured(
            @PathVariable Long id,
            @RequestParam Boolean featured) {

        ProductResponseDTO product = adminService.setProductFeatured(id, featured);
        return ResponseEntity.ok(ApiResponseDTO.success(
                featured ? "Product marked as featured" : "Product removed from featured", product));
    }

    /**
     * Toggle product active status
     * PATCH /api/admin/products/{id}/status?active=false
     */
    @PatchMapping("/products/{id}/status")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> toggleProductStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        ProductResponseDTO product = adminService.setProductActive(id, active);
        return ResponseEntity.ok(ApiResponseDTO.success(
                active ? "Product activated" : "Product deactivated", product));
    }
}
