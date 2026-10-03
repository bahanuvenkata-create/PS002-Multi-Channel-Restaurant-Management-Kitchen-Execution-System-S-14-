package com.bistrobyte.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "restaurant_staff")
public class RestaurantStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long restaurantId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String role; // RESTAURANT_MANAGER, KITCHEN_STAFF, CHEF, DELIVERY_STAFF, CASHIER, SERVICE_STAFF

    private String profilePhoto;

    @Column(nullable = false)
    private String employmentStatus = "ACTIVE"; // ACTIVE, ON_LEAVE, INACTIVE

    private LocalDate joiningDate = LocalDate.now();

    private String shift = "Morning (06:00 - 15:00)"; // Morning, Evening, Night, Flexible

    private String assignedArea;

    private String password = "password";

    public RestaurantStaff() {}

    public RestaurantStaff(Long restaurantId, String name, String email, String phone, String role, String shift, String assignedArea, String password) {
        this.restaurantId = restaurantId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.shift = shift != null ? shift : "Morning (06:00 - 15:00)";
        this.assignedArea = assignedArea;
        this.password = password != null ? password : "password";
        this.employmentStatus = "ACTIVE";
        this.joiningDate = LocalDate.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getAssignedArea() { return assignedArea; }
    public void setAssignedArea(String assignedArea) { this.assignedArea = assignedArea; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
