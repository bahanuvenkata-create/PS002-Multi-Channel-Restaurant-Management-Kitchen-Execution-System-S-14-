package com.bistrobyte.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurant_users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ROLE_CUSTOMER, ROLE_RESTAURANT_OWNER, ROLE_KITCHEN_STAFF, ROLE_DELIVERY_STAFF, ROLE_ADMIN

    private String phone;

    private String profilePhoto;

    private String preferredLanguage = "en";

    private String foodPreference = "Any"; // Veg, Non-Veg, Vegan, Any

    private String cuisinePreference; // e.g. "Andhra, South Indian"

    private String spiceLevel = "Medium"; // Mild, Medium, Spicy

    private String budget = "Medium"; // Low, Medium, Premium

    @Column(columnDefinition = "TEXT")
    private String addresses; // JSON array string or comma separated

    @Column(columnDefinition = "TEXT")
    private String favoriteFoods;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    private Long restaurantId;

    public User() {}

    public User(String name, String email, String password, String role, String phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getFoodPreference() { return foodPreference; }
    public void setFoodPreference(String foodPreference) { this.foodPreference = foodPreference; }

    public String getCuisinePreference() { return cuisinePreference; }
    public void setCuisinePreference(String cuisinePreference) { this.cuisinePreference = cuisinePreference; }

    public String getSpiceLevel() { return spiceLevel; }
    public void setSpiceLevel(String spiceLevel) { this.spiceLevel = spiceLevel; }

    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }

    public String getAddresses() { return addresses; }
    public void setAddresses(String addresses) { this.addresses = addresses; }

    public String getFavoriteFoods() { return favoriteFoods; }
    public void setFavoriteFoods(String favoriteFoods) { this.favoriteFoods = favoriteFoods; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
}
