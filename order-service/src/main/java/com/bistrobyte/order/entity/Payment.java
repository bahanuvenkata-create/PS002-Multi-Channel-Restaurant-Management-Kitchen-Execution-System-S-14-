package com.bistrobyte.order.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    private String orderNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String method; // UPI, CARD, COD, WALLET

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED

    private String transactionRef;

    private String upiVpa;

    private String cardLast4;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Payment() {}

    public Payment(Long orderId, String orderNumber, Double amount, String method, String status, String transactionRef) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.transactionRef = transactionRef;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getUpiVpa() { return upiVpa; }
    public void setUpiVpa(String upiVpa) { this.upiVpa = upiVpa; }

    public String getCardLast4() { return cardLast4; }
    public void setCardLast4(String cardLast4) { this.cardLast4 = cardLast4; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
