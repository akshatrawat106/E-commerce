package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.category.CategoryRequestDTO;
import com.akshat.ecommerce.DTO.category.CategoryResponseDTO;
import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.Service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> createCategory(
            @Valid @RequestBody CategoryRequestDTO request) {

        CategoryResponseDTO category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Category created", category));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<CategoryResponseDTO>>> getAllCategories() {
        List<CategoryResponseDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponseDTO.success(categories));
    }

    @GetMapping("/main")
    public ResponseEntity<ApiResponseDTO<List<CategoryResponseDTO>>> getMainCategories() {
        List<CategoryResponseDTO> categories = categoryService.getMainCategories();
        return ResponseEntity.ok(ApiResponseDTO.success(categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> getCategoryById(
            @PathVariable Long id) {

        CategoryResponseDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponseDTO.success(category));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> getCategoryBySlug(
            @PathVariable String slug) {

        CategoryResponseDTO category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponseDTO.success(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<CategoryResponseDTO>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO request) {

        CategoryResponseDTO category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Category updated", category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponseDTO.success("Category deleted", null));
    }
}