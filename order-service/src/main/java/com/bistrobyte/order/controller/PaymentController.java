package com.bistrobyte.order.controller;

import com.bistrobyte.order.entity.Payment;
import com.bistrobyte.order.entity.RestaurantOrder;
import com.bistrobyte.order.repository.OrderRepository;
import com.bistrobyte.order.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentController(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // Process Simulated Payment with full backend state transition
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> req) {
        if (!req.containsKey("orderId") || req.get("orderId") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderId is required"));
        }

        Long orderId = Long.parseLong(req.get("orderId").toString());
        Optional<RestaurantOrder> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order ID not found: " + orderId));
        }

        RestaurantOrder order = orderOpt.get();
        String method = req.getOrDefault("method", "UPI").toString().toUpperCase();
        Double amount = req.containsKey("amount") ? Double.parseDouble(req.get("amount").toString()) : order.getTotalAmount();

        // Generate unique verified transaction reference
        String txnRef = "TXN-" + method + "-" + (100000 + new Random().nextInt(900000));

        Payment payment = new Payment(order.getId(), order.getOrderNumber(), amount, method, "SUCCESS", txnRef);
        if (req.containsKey("upiVpa") && req.get("upiVpa") != null) {
            payment.setUpiVpa(req.get("upiVpa").toString());
        }
        if (req.containsKey("cardLast4") && req.get("cardLast4") != null) {
            payment.setCardLast4(req.get("cardLast4").toString());
        }

        Payment savedPayment = paymentRepository.save(payment);

        // Update Order State in Database
        order.setPaymentStatus("SUCCESS");
        order.setPaymentMethod(method);
        order.setPaymentId(savedPayment.getId().toString());
        order.setStatus("CONFIRMED");
        order.setInvoiceNumber("INV-" + order.getOrderNumber());
        orderRepository.save(order);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "SUCCESS");
        resp.put("paymentId", savedPayment.getId());
        resp.put("transactionRef", txnRef);
        resp.put("orderId", order.getId());
        resp.put("orderNumber", order.getOrderNumber());
        resp.put("invoiceNumber", order.getInvoiceNumber());
        resp.put("paymentStatus", "SUCCESS");
        resp.put("orderStatus", "CONFIRMED");
        resp.put("amount", amount);
        resp.put("timestamp", savedPayment.getCreatedAt());

        return ResponseEntity.ok(resp);
    }

    // Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        return paymentRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Get payment for order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrder(@PathVariable Long orderId) {
        return paymentRepository.findByOrderId(orderId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
