package com.akshat.ecommerce.controller;


import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.common.PageResponseDTO;
import com.akshat.ecommerce.DTO.product.ProductRequestDTO;
import com.akshat.ecommerce.DTO.product.ProductResponseDTO;
import com.akshat.ecommerce.Service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> createProduct(
            @Valid @RequestBody ProductRequestDTO request) {

        ProductResponseDTO product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Product created", product));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<ProductResponseDTO>>> getAllProducts() {
        List<ProductResponseDTO> products = productService.getAllActiveProducts();
        return ResponseEntity.ok(ApiResponseDTO.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> getProductById(
            @PathVariable Long id) {

        ProductResponseDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponseDTO.success(product));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> getProductBySlug(
            @PathVariable String slug) {

        ProductResponseDTO product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponseDTO.success(product));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponseDTO<PageResponseDTO<ProductResponseDTO>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponseDTO<ProductResponseDTO> products =
                productService.getProductsByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponseDTO.success(products));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponseDTO<List<ProductResponseDTO>>> getFeaturedProducts() {
        List<ProductResponseDTO> products = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponseDTO.success(products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponseDTO<List<ProductResponseDTO>>> searchProducts(
            @RequestParam String keyword) {

        List<ProductResponseDTO> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(ApiResponseDTO.success(products));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<ProductResponseDTO>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request) {

        ProductResponseDTO product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Product updated", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponseDTO.success("Product deleted", null));
    }
}