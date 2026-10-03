package com.bistrobyte.order.repository;

import com.bistrobyte.order.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    List<Review> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    Optional<Review> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
}
