package com.akshat.ecommerce.Service;


import com.akshat.ecommerce.DTO.payment.PaymentRequestDTO;
import com.akshat.ecommerce.DTO.payment.PaymentResponseDTO;
import com.akshat.ecommerce.Entity.Order;
import com.akshat.ecommerce.Entity.Payment;
import com.akshat.ecommerce.Repository.OrderRepository;
import com.akshat.ecommerce.Repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {
     @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public String getKeyId() {
        return keyId;
    }

    @Transactional
    public String createRazorpayOrder(Order order) {
        RazorpayClient razorpayClient;
        try {
            razorpayClient = new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            throw new RuntimeException("Razorpay client initialization failed: " + e.getMessage(), e);
        }

        BigDecimal amountInPaise = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP);

        if (amountInPaise.compareTo(BigDecimal.ONE) < 0) {
             throw new RuntimeException("Error creating Razorpay order: Amount must be at least 1.00 INR");
        }

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise.intValueExact());
        options.put("currency", "INR");
        String receipt = "receipt_" + order.getOrderNumber();
        if (receipt.length() > 40) {
            receipt = receipt.substring(0, 40);
        }
        options.put("receipt", receipt);

        com.razorpay.Order razorpayOrder;
        try {
            razorpayOrder = razorpayClient.orders.create(options);
        } catch (RazorpayException e) {
            System.err.println("Razorpay Error: " + e.getMessage());
            if (keyId.startsWith("rzp_test_your_key")) {
                throw new RuntimeException("Razorpay order creation failed. It seems you are using placeholder keys in application.properties. Please replace 'razorpay.key_id' and 'razorpay.key_secret' with your actual Razorpay dashboard credentials. Error: " + e.getMessage(), e);
            }
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage(), e);
        }
        String razorpayOrderId = razorpayOrder.get("id");

        // Save initial payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod("RAZORPAY");
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency("INR");
        payment.setStatus(Payment.Status.PENDING);
        payment.setTransactionId(razorpayOrderId);
        paymentRepository.save(payment);

        return razorpayOrderId;
    }

    @Transactional
    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

            if (isValid) {
                Payment payment = paymentRepository.findByTransactionId(razorpayOrderId)
                        .orElseThrow(() -> new RuntimeException("Payment not found for order id: " + razorpayOrderId));

                payment.setStatus(Payment.Status.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
                // Update transactionId to the actual paymentId or keep orderId as primary? 
                // Usually orderId is used to track the transaction in our system initially.
                // Let's keep transactionId as razorpayOrderId for now, or update it.
                paymentRepository.save(payment);

                Order order = payment.getOrder();
                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setStatus(Order.Status.PROCESSING);
                orderRepository.save(order);
            }
            return isValid;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Reuse the existing pending payment/razorpay order if one already exists for this order
        Payment existingPayment = paymentRepository.findByOrderId(order.getId())
                .stream()
                .filter(p -> p.getStatus() == Payment.Status.PENDING)
                .findFirst()
                .orElse(null);

        if (existingPayment != null) {
            return mapToResponse(existingPayment);
        }

        // Create a new Razorpay order only if none exists yet
        com.razorpay.Order razorpayOrder;
        try {
            razorpayOrder = createRazorpayOrderInternal(request);
        } catch (RazorpayException e) {
            throw new RuntimeException("Razorpay order creation failed: " + e.getMessage(), e);
        }

        String razorpayOrderId = razorpayOrder.get("id");

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(request.getAmount());
        payment.setCurrency("INR");
        payment.setStatus(Payment.Status.PENDING);
        payment.setTransactionId(razorpayOrderId);

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    private com.razorpay.Order createRazorpayOrderInternal(PaymentRequestDTO request)
            throws RazorpayException {

        RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

        BigDecimal amountInPaise = request.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP);

        if (amountInPaise.compareTo(BigDecimal.ONE) < 0) {
            throw new RazorpayException("Amount must be at least 1.00 INR");
        }

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise.intValueExact()); // MUST be int
        options.put("currency", "INR");
        String receipt = "receipt_" + UUID.randomUUID();
        if (receipt.length() > 40) {
            receipt = receipt.substring(0, 40);
        }
        options.put("receipt", receipt);

        try {
            return razorpayClient.orders.create(options);
        } catch (RazorpayException e) {
            System.err.println("Razorpay Internal Error: " + e.getMessage());
            if (keyId.startsWith("rzp_test_your_key")) {
                throw new RazorpayException("Razorpay order creation failed. Please replace placeholder keys in application.properties with real ones. Original error: " + e.getMessage());
            }
            throw e;
        }
    }

    private PaymentResponseDTO mapToResponse(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(payment.getId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setTransactionId(payment.getTransactionId());
        dto.setAmount(payment.getAmount());
        dto.setCurrency(payment.getCurrency());
        dto.setStatus(payment.getStatus().name());
        dto.setPaidAt(payment.getPaidAt());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }

    public List<PaymentResponseDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    public PaymentResponseDTO getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

}