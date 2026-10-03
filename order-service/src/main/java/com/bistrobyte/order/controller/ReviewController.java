package com.bistrobyte.order.controller;

import com.bistrobyte.order.entity.RestaurantOrder;
import com.bistrobyte.order.entity.Review;
import com.bistrobyte.order.repository.OrderRepository;
import com.bistrobyte.order.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin("*")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public ReviewController(ReviewRepository reviewRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    // Submit review (Only allowed for completed/delivered orders)
    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody Review review) {
        if (review.getOrderId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "orderId is required to submit a review"));
        }

        Optional<RestaurantOrder> orderOpt = orderRepository.findById(review.getOrderId());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Order not found with ID: " + review.getOrderId()));
        }

        RestaurantOrder order = orderOpt.get();

        // Check if already reviewed
        if (reviewRepository.existsByOrderId(order.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "A review has already been submitted for this order."));
        }

        // Verify that the order has been completed or delivered
        String status = order.getStatus().toUpperCase();
        if (!status.contains("COMPLETED") && !status.contains("DELIVERED") && !status.contains("READY")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reviews can only be submitted after your order is delivered or completed. Current status: " + status));
        }

        if (review.getRestaurantId() == null) {
            review.setRestaurantId(order.getRestaurantId() != null ? order.getRestaurantId() : 1L);
        }
        if (review.getRestaurantName() == null) {
            review.setRestaurantName(order.getRestaurantName());
        }
        if (review.getCustomerEmail() == null) {
            review.setCustomerEmail(order.getCustomerEmail());
        }
        if (review.getCustomerName() == null) {
            review.setCustomerName(order.getCustomerName());
        }

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "message", "Thank you! Your verified review has been published.",
            "review", saved
        ));
    }

    // Get reviews for a restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Review>> getRestaurantReviews(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId));
    }

    // Get customer's submitted reviews
    @GetMapping("/customer/{email}")
    public ResponseEntity<List<Review>> getCustomerReviews(@PathVariable String email) {
        return ResponseEntity.ok(reviewRepository.findByCustomerEmailOrderByCreatedAtDesc(email));
    }
}
