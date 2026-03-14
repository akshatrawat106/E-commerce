package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.review.ReviewRequestDTO;
import com.akshat.ecommerce.DTO.review.ReviewResponseDTO;
import com.akshat.ecommerce.Service.ReviewService;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Get all reviews for a product (public)
     * GET /api/reviews/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponseDTO<List<ReviewResponseDTO>>> getProductReviews(
            @PathVariable Long productId) {

        List<ReviewResponseDTO> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponseDTO.success(reviews));
    }

    /**
     * Get average rating for a product (public)
     * GET /api/reviews/product/{productId}/rating
     */
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getProductRating(
            @PathVariable Long productId) {

        Double avgRating = reviewService.getAverageRating(productId);
        Long count = reviewService.getReviewCount(productId);
        return ResponseEntity.ok(ApiResponseDTO.success(
                Map.of("averageRating", avgRating != null ? avgRating : 0.0, "reviewCount", count)
        ));
    }

    /**
     * Submit a review for a product (authenticated users)
     * POST /api/reviews/product/{productId}
     */
    @PostMapping("/product/{productId}")
    public ResponseEntity<ApiResponseDTO<ReviewResponseDTO>> createReview(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequestDTO request) {

        ReviewResponseDTO review = reviewService.createReview(userPrincipal.getId(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Review submitted", review));
    }

    /**
     * Update own review
     * PUT /api/reviews/{reviewId}
     */
    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponseDTO<ReviewResponseDTO>> updateReview(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequestDTO request) {

        ReviewResponseDTO review = reviewService.updateReview(userPrincipal.getId(), reviewId, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Review updated", review));
    }

    /**
     * Delete own review (or admin can delete any)
     * DELETE /api/reviews/{reviewId}
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteReview(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long reviewId) {

        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        reviewService.deleteReview(userPrincipal.getId(), reviewId, isAdmin);
        return ResponseEntity.ok(ApiResponseDTO.success("Review deleted", null));
    }

    /**
     * Get current user's reviews
     * GET /api/reviews/my
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponseDTO<List<ReviewResponseDTO>>> getMyReviews(
            @CurrentUser UserPrincipal userPrincipal) {

        List<ReviewResponseDTO> reviews = reviewService.getUserReviews(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(reviews));
    }
}
