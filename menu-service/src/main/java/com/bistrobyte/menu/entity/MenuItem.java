package com.bistrobyte.menu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // Starters, Mains, Desserts, Beverages, Chef Specials

    @Column(nullable = false)
    private Double price;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Boolean isAvailable = true; // Prevents ordering sold-out dishes

    private Integer prepTimeMinutes = 15;

    private String dietaryType = "Veg"; // Veg, Non-Veg, Vegan

    private Integer spicyLevel = 1; // 0, 1, 2, 3

    private String imageUrl;

    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(name = "meal_type")
    private String mealType = "Any"; // Tiffin, Lunch, Snacks, Dinner, Any

    @Column(name = "cuisine_type")
    private String cuisineType = "Generic";

    public MenuItem() {}

    public MenuItem(String name, String category, Double price, String description,
                    Boolean isAvailable, Integer prepTimeMinutes, String dietaryType,
                    Integer spicyLevel, String imageUrl, Long restaurantId,
                    String mealType, String cuisineType) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
        this.isAvailable = isAvailable;
        this.prepTimeMinutes = prepTimeMinutes;
        this.dietaryType = dietaryType;
        this.spicyLevel = spicyLevel;
        this.imageUrl = imageUrl;
        this.restaurantId = restaurantId;
        this.mealType = mealType;
        this.cuisineType = cuisineType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getCuisineType() {
        return cuisineType;
    }

    public void setCuisineType(String cuisineType) {
        this.cuisineType = cuisineType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Integer getPrepTimeMinutes() {
        return prepTimeMinutes;
    }

    public void setPrepTimeMinutes(Integer prepTimeMinutes) {
        this.prepTimeMinutes = prepTimeMinutes;
    }

    public String getDietaryType() {
        return dietaryType;
    }

    public void setDietaryType(String dietaryType) {
        this.dietaryType = dietaryType;
    }

    public Integer getSpicyLevel() {
        return spicyLevel;
    }

    public void setSpicyLevel(Integer spicyLevel) {
        this.spicyLevel = spicyLevel;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
