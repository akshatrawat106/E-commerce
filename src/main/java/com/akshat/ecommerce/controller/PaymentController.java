package com.akshat.ecommerce.controller;


import com.akshat.ecommerce.DTO.common.ApiResponseDTO;
import com.akshat.ecommerce.DTO.payment.PaymentRequestDTO;
import com.akshat.ecommerce.DTO.payment.PaymentResponseDTO;
import com.akshat.ecommerce.DTO.payment.PaymentVerificationRequestDTO;
import com.akshat.ecommerce.Service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO<PaymentResponseDTO>> processPayment(
            @Valid @RequestBody PaymentRequestDTO request) {

        PaymentResponseDTO payment = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponseDTO.success("Payment processed", payment));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponseDTO<String>> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequestDTO request) {

        boolean isValid = paymentService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            return ResponseEntity.ok(ApiResponseDTO.success("Payment verified successfully", null));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error("Payment verification failed"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<PaymentResponseDTO>> getPaymentById(
            @PathVariable Long id) {

        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponseDTO.success(payment));
    }

}