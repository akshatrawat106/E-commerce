package com.akshat.ecommerce.Repository;

import com.akshat.ecommerce.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByOrderId(Long orderId);

    List<Payment> findByStatus(Payment.Status status);

    List<Payment> findByOrderIdAndStatus(Long orderId, Payment.Status status);
}