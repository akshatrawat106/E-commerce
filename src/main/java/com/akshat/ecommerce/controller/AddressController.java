package com.akshat.ecommerce.controller;

import com.akshat.ecommerce.DTO.address.AddressRequestDTO;
import com.akshat.ecommerce.DTO.address.AddressResponseDTO;
import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.Service.AddressService;
import com.akshat.ecommerce.security.CurrentUser;
import com.akshat.ecommerce.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Address endpoints — all use JWT to identify the current user.
 * No userId in URL path (security best practice).
 */
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    /**
     * Add a new address for the current user
     * POST /api/addresses
     */
    @PostMapping
    public ResponseEntity<ApiResponseDTO<AddressResponseDTO>> addAddress(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody AddressRequestDTO request) {

        AddressResponseDTO address = addressService.addAddress(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success("Address added", address));
    }

    /**
     * Get all addresses for the current user
     * GET /api/addresses
     */
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<AddressResponseDTO>>> getMyAddresses(
            @CurrentUser UserPrincipal userPrincipal) {

        List<AddressResponseDTO> addresses = addressService.getUserAddresses(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(addresses));
    }

    /**
     * Get a specific address by ID (only if it belongs to current user)
     * GET /api/addresses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<AddressResponseDTO>> getAddressById(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long id) {

        AddressResponseDTO address = addressService.getAddressById(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponseDTO.success(address));
    }

    /**
     * Update an address (only if it belongs to current user)
     * PUT /api/addresses/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<AddressResponseDTO>> updateAddress(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDTO request) {

        AddressResponseDTO address = addressService.updateAddress(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Address updated", address));
    }

    /**
     * Delete an address (only if it belongs to current user)
     * DELETE /api/addresses/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> deleteAddress(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long id) {

        addressService.deleteAddress(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponseDTO.success("Address deleted", null));
    }

    /**
     * Set an address as default
     * PATCH /api/addresses/{id}/default
     */
    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponseDTO<AddressResponseDTO>> setDefaultAddress(
            @CurrentUser UserPrincipal userPrincipal,
            @PathVariable Long id) {

        AddressResponseDTO address = addressService.setDefaultAddress(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponseDTO.success("Default address updated", address));
    }
}
