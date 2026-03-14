package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.AuthResponseDTO;
import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.user.ChangePasswordDTO;
import com.akshat.ecommerce.DTO.user.LoginRequestDTO;
import com.akshat.ecommerce.DTO.user.UpdateProfileDTO;
import com.akshat.ecommerce.DTO.user.UserRequestDTO;
import com.akshat.ecommerce.DTO.user.UserResponseDTO;
import com.akshat.ecommerce.Entity.User;
import com.akshat.ecommerce.Repository.UserRepository;
import com.akshat.ecommerce.Service.UserService;
import com.akshat.ecommerce.exception.BadRequestException;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.JwtTokenProvider;
import com.akshat.ecommerce.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponseDTO<AuthResponseDTO>> register(
            @Valid @RequestBody UserRequestDTO request) {

        UserResponseDTO user = userService.register(request);

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);

        AuthResponseDTO response = buildAuthResponse(token, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Registration successful", response));
    }

    /**
     * Login with email and password
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO<AuthResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        UserResponseDTO user = userService.getUserByEmail(request.getEmail());
        AuthResponseDTO response = buildAuthResponse(token, user);

        return ResponseEntity.ok(ApiResponseDTO.success("Login successful", response));
    }

    /**
     * Get currently authenticated user's profile
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponseDTO<UserResponseDTO>> getCurrentUser(
            @CurrentUser UserPrincipal userPrincipal) {

        UserResponseDTO user = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(user));
    }

    /**
     * Update currently authenticated user's profile
     * PUT /api/auth/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponseDTO<UserResponseDTO>> updateProfile(
            @CurrentUser UserPrincipal userPrincipal,
            @RequestBody UpdateProfileDTO request) {

        UserResponseDTO user = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponseDTO.success("Profile updated successfully", user));
    }

    /**
     * Change password for currently authenticated user
     * POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponseDTO<Void>> changePassword(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordDTO request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        userService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponseDTO.success("Password changed successfully", null));
    }

    private AuthResponseDTO buildAuthResponse(String token, UserResponseDTO user) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setTokenType("Bearer");
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        return response;
    }
}
