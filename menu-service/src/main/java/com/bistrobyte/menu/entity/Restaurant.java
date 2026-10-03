package com.bistrobyte.menu.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_place_id")
    private String externalPlaceId;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    private Double latitude;
    private Double longitude;

    private Double rating;
    
    @Column(name = "rating_count")
    private Integer ratingCount;

    @Column(nullable = false)
    private String cuisine; // e.g., "Andhra • South Indian"

    @Column(name = "opening_time")
    private String openingTime;

    @Column(name = "closing_time")
    private String closingTime;

    @Column(name = "delivery_time_mins")
    private String deliveryTimeMins; // e.g., "25-35"

    @Column(name = "minimum_order")
    private Double minimumOrder;

    @Column(name = "delivery_fee")
    private Double deliveryFee;

    @Column(name = "is_veg_only")
    private Boolean isVegOnly;
    
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "is_open")
    private Boolean isOpen;

    @Column(name = "partner_status")
    private String partnerStatus = "PARTNER"; // PARTNER, DISCOVERY

    @Column(name = "map_url", length = 1000)
    private String mapUrl;

    @Column(name = "price_level")
    private Integer priceLevel = 2; // 1: budget, 2: mid, 3: fine-dining

    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Transient
    private Double distance; // Calculated dynamically via Haversine

    public Restaurant(String name, String description, String address, Double latitude, Double longitude, Double rating, Integer ratingCount, String cuisine, String openingTime, String closingTime, String deliveryTimeMins, Double minimumOrder, Double deliveryFee, Boolean isVegOnly, String imageUrl, Boolean isOpen) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.cuisine = cuisine;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.deliveryTimeMins = deliveryTimeMins;
        this.minimumOrder = minimumOrder;
        this.deliveryFee = deliveryFee;
        this.isVegOnly = isVegOnly;
        this.imageUrl = imageUrl;
        this.isOpen = isOpen;
        this.partnerStatus = "PARTNER";
        this.status = "ACTIVE";
    }
}
