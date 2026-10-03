package com.bistrobyte.auth.controller;

import com.bistrobyte.auth.entity.RestaurantStaff;
import com.bistrobyte.auth.repository.RestaurantStaffRepository;
import com.bistrobyte.auth.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    private final RestaurantStaffRepository staffRepository;
    private final JwtUtil jwtUtil;

    public StaffController(RestaurantStaffRepository staffRepository, JwtUtil jwtUtil) {
        this.staffRepository = staffRepository;
        this.jwtUtil = jwtUtil;
    }

    // Individual Staff Login
    @PostMapping("/login")
    public ResponseEntity<?> staffLogin(@RequestBody Map<String, String> creds) {
        String email = creds.get("email");
        String password = creds.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<RestaurantStaff> staffOpt = staffRepository.findByEmail(email);
        if (staffOpt.isEmpty() || !staffOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid staff credentials"));
        }

        RestaurantStaff staff = staffOpt.get();
        if ("INACTIVE".equalsIgnoreCase(staff.getEmploymentStatus())) {
            return ResponseEntity.status(403).body(Map.of("error", "Account has been deactivated. Please contact restaurant administration."));
        }

        String roleClaim = "ROLE_" + staff.getRole().toUpperCase().replace("ROLE_", "");
        String token = jwtUtil.generateToken(staff.getEmail(), roleClaim, staff.getName(), staff.getRestaurantId());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "SUCCESS");
        resp.put("token", token);
        resp.put("staffId", staff.getId());
        resp.put("name", staff.getName());
        resp.put("email", staff.getEmail());
        resp.put("role", staff.getRole());
        resp.put("restaurantId", staff.getRestaurantId());
        resp.put("shift", staff.getShift());
        resp.put("assignedArea", staff.getAssignedArea());
        return ResponseEntity.ok(resp);
    }

    // Get staff for a specific restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<RestaurantStaff>> getStaffByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(staffRepository.findByRestaurantId(restaurantId));
    }

    // Add new staff member
    @PostMapping
    public ResponseEntity<?> addStaff(@RequestBody RestaurantStaff staff) {
        if (staff.getEmail() == null || staff.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (staffRepository.existsByEmail(staff.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Staff member with email already exists"));
        }
        if (staff.getPassword() == null || staff.getPassword().isBlank()) {
            staff.setPassword("password");
        }
        RestaurantStaff saved = staffRepository.save(staff);
        return ResponseEntity.ok(saved);
    }

    // Update staff member
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody RestaurantStaff details) {
        return staffRepository.findById(id).map(existing -> {
            if (details.getName() != null) existing.setName(details.getName());
            if (details.getPhone() != null) existing.setPhone(details.getPhone());
            if (details.getRole() != null) existing.setRole(details.getRole());
            if (details.getShift() != null) existing.setShift(details.getShift());
            if (details.getAssignedArea() != null) existing.setAssignedArea(details.getAssignedArea());
            if (details.getEmploymentStatus() != null) existing.setEmploymentStatus(details.getEmploymentStatus());
            if (details.getProfilePhoto() != null) existing.setProfilePhoto(details.getProfilePhoto());
            return ResponseEntity.ok(staffRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Deactivate staff member
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateStaff(@PathVariable Long id) {
        return staffRepository.findById(id).map(existing -> {
            existing.setEmploymentStatus("INACTIVE");
            staffRepository.save(existing);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Staff deactivated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Seed default staff for demo restaurants
    @GetMapping("/seed")
    public ResponseEntity<?> seedDemoStaff() {
        if (staffRepository.count() > 0) {
            return ResponseEntity.ok(Map.of("message", "Staff records already exist", "count", staffRepository.count()));
        }

        List<RestaurantStaff> demoStaff = List.of(
            new RestaurantStaff(1L, "Ramesh Rao", "chef.ramesh@bistrobyte.com", "+91-9876543201", "CHEF", "Morning (06:00 - 15:00)", "Main Kitchen", "password"),
            new RestaurantStaff(1L, "Kiran Kumar", "kitchen.kiran@bistrobyte.com", "+91-9876543202", "KITCHEN_STAFF", "Morning (06:00 - 15:00)", "Appetizers Station", "password"),
            new RestaurantStaff(1L, "Suresh Delivery", "delivery.suresh@bistrobyte.com", "+91-9876543203", "DELIVERY_STAFF", "Full Day", "Zone A - University Campus", "password"),
            new RestaurantStaff(1L, "Vikram Manager", "manager.vikram@bistrobyte.com", "+91-9876543204", "RESTAURANT_MANAGER", "All Day", "Floor & Operations", "password"),
            new RestaurantStaff(2L, "Lakshmi Devi", "chef.lakshmi@bistrobyte.com", "+91-9876543205", "CHEF", "Morning (05:30 - 14:30)", "Tiffin Section", "password"),
            new RestaurantStaff(3L, "Marco Rossi", "chef.marco@bistrobyte.com", "+91-9876543206", "CHEF", "Evening (16:00 - 23:00)", "Woodfire Oven", "password")
        );
        staffRepository.saveAll(demoStaff);
        return ResponseEntity.ok(Map.of("message", "Seeded demo staff members", "count", demoStaff.size()));
    }
}
