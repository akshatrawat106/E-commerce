package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.common.PageResponseDTO;
import com.akshat.ecommerce.DTO.user.UserResponseDTO;
import com.akshat.ecommerce.Service.UserService;
import com.akshat.ecommerce.exception.UnauthorizedException;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ========================
    //    ADMIN-ONLY ENDPOINTS
    // ========================

    /**
     * Get all users with pagination (ADMIN only)
     * GET /api/users?page=0&size=10
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<PageResponseDTO<UserResponseDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponseDTO<UserResponseDTO> users = userService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponseDTO.success(users));
    }

    /**
     * Get any user by ID (ADMIN only)
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<UserResponseDTO>> getUserById(@PathVariable Long id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponseDTO.success(user));
    }

    /**
     * Activate or deactivate a user (ADMIN only)
     * PATCH /api/users/{id}/status?active=true|false
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<UserResponseDTO>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        UserResponseDTO user = userService.setUserActiveStatus(id, active);
        String msg = active ? "User activated successfully" : "User deactivated successfully";
        return ResponseEntity.ok(ApiResponseDTO.success(msg, user));
    }

    /**
     * Promote or demote user role (ADMIN only)
     * PATCH /api/users/{id}/role?role=ADMIN|CUSTOMER
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<UserResponseDTO>> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {

        UserResponseDTO user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponseDTO.success("User role updated to " + role, user));
    }

    /**
     * Delete a user (ADMIN only)
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<Void>> deleteUser(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {

        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You cannot delete your own account via admin panel.");
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponseDTO.success("User deleted successfully", null));
    }

    /**
     * Search users by name or email (ADMIN only)
     * GET /api/users/search?query=abc
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponseDTO<List<UserResponseDTO>>> searchUsers(
            @RequestParam String query) {

        List<UserResponseDTO> users = userService.searchUsers(query);
        return ResponseEntity.ok(ApiResponseDTO.success(users));
    }
}
