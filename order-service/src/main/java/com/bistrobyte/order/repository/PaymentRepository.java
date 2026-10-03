package com.bistrobyte.order.repository;

import com.bistrobyte.order.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByOrderNumber(String orderNumber);
    Optional<Payment> findByTransactionRef(String transactionRef);
    List<Payment> findByStatus(String status);
}
