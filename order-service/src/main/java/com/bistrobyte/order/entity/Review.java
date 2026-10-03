package com.bistrobyte.order.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long restaurantId;

    private String restaurantName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private Double foodRating; // 1.0 to 5.0

    @Column(nullable = false)
    private Double restaurantRating; // 1.0 to 5.0

    private Double tasteRating = 5.0;
    private Double qualityRating = 5.0;
    private Double packagingRating = 5.0;
    private Double serviceRating = 5.0;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}

    public Review(Long orderId, Long restaurantId, String restaurantName, String customerEmail, String customerName, Double foodRating, Double restaurantRating, String comment) {
        this.orderId = orderId;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.foodRating = foodRating;
        this.restaurantRating = restaurantRating;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Double getFoodRating() { return foodRating; }
    public void setFoodRating(Double foodRating) { this.foodRating = foodRating; }

    public Double getRestaurantRating() { return restaurantRating; }
    public void setRestaurantRating(Double restaurantRating) { this.restaurantRating = restaurantRating; }

    public Double getTasteRating() { return tasteRating; }
    public void setTasteRating(Double tasteRating) { this.tasteRating = tasteRating; }

    public Double getQualityRating() { return qualityRating; }
    public void setQualityRating(Double qualityRating) { this.qualityRating = qualityRating; }

    public Double getPackagingRating() { return packagingRating; }
    public void setPackagingRating(Double packagingRating) { this.packagingRating = packagingRating; }

    public Double getServiceRating() { return serviceRating; }
    public void setServiceRating(Double serviceRating) { this.serviceRating = serviceRating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
