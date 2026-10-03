package com.bistrobyte.auth.controller;

import com.bistrobyte.auth.entity.User;
import com.bistrobyte.auth.repository.UserRepository;
import com.bistrobyte.auth.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // GET ALL USERS
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> list = userRepository.findAll().stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("phone", u.getPhone());
            map.put("foodPreference", u.getFoodPreference());
            map.put("spiceLevel", u.getSpiceLevel());
            map.put("cuisinePreference", u.getCuisinePreference());
            map.put("budget", u.getBudget());
            map.put("restaurantId", u.getRestaurantId());
            return map;
        }).toList();
        return ResponseEntity.ok(list);
    }

    // READY-TO-USE DEMO TOKENS
    @GetMapping("/demo-tokens")
    public ResponseEntity<Map<String, Object>> getDemoTokens() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("admin_token", jwtUtil.generateToken("admin@bistrobyte.com", "ROLE_ADMIN", "Restaurant Admin"));
        response.put("owner_token", jwtUtil.generateToken("owner@bistrobyte.com", "ROLE_RESTAURANT_OWNER", "BistroByte Owner", 1L));
        response.put("chef_token", jwtUtil.generateToken("chef@bistrobyte.com", "ROLE_CHEF", "Head Chef Gordon", 1L));
        response.put("kitchen_token", jwtUtil.generateToken("kitchen@bistrobyte.com", "ROLE_KITCHEN_STAFF", "Kitchen Lead Kiran", 1L));
        response.put("delivery_token", jwtUtil.generateToken("delivery@bistrobyte.com", "ROLE_DELIVERY_STAFF", "Rider Suresh", 1L));
        response.put("customer_token", jwtUtil.generateToken("customer@bistrobyte.com", "ROLE_CUSTOMER", "Alice Customer"));
        response.put("token_type", "Bearer");
        response.put("expires_in_hours", 24);
        return ResponseEntity.ok(response);
    }

    // QUICK LOGIN FOR UNIVERSITY DEMOS
    @GetMapping("/quick-login")
    public ResponseEntity<Map<String, Object>> quickLogin(@RequestParam(defaultValue = "CUSTOMER") String role) {
        String roleName = role.toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        String email;
        String name;
        Long restaurantId = null;

        if (roleName.contains("ADMIN")) {
            email = "admin@bistrobyte.com";
            name = "Platform Administrator";
            roleName = "ROLE_ADMIN";
        } else if (roleName.contains("OWNER")) {
            email = "owner@bistrobyte.com";
            name = "Suresh Owner";
            roleName = "ROLE_RESTAURANT_OWNER";
            restaurantId = 1L;
        } else if (roleName.contains("CHEF")) {
            email = "chef@bistrobyte.com";
            name = "Head Chef Gordon";
            roleName = "ROLE_CHEF";
            restaurantId = 1L;
        } else if (roleName.contains("KITCHEN") || roleName.contains("STAFF")) {
            email = "kitchen@bistrobyte.com";
            name = "Kitchen Lead Kiran";
            roleName = "ROLE_KITCHEN_STAFF";
            restaurantId = 1L;
        } else if (roleName.contains("DELIVERY")) {
            email = "delivery@bistrobyte.com";
            name = "Rider Suresh";
            roleName = "ROLE_DELIVERY_STAFF";
            restaurantId = 1L;
        } else if (roleName.contains("SAI") || roleName.contains("NIKHIL")) {
            email = "sainikhil0207@gmail.com";
            name = "Sai Nikhil";
            roleName = "ROLE_CUSTOMER";
        } else {
            email = "customer@bistrobyte.com";
            name = "Alice Customer";
            roleName = "ROLE_CUSTOMER";
        }

        Optional<User> uOpt = userRepository.findByEmail(email);
        User user = uOpt.orElse(null);

        String token = jwtUtil.generateToken(email, roleName, name, restaurantId);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Quick login successful for role " + roleName);
        response.put("name", name);
        response.put("email", email);
        response.put("role", roleName);
        response.put("token", token);
        response.put("restaurantId", restaurantId);
        if (user != null) {
            response.put("phone", user.getPhone());
            response.put("foodPreference", user.getFoodPreference());
            response.put("spiceLevel", user.getSpiceLevel());
            response.put("cuisinePreference", user.getCuisinePreference());
            response.put("budget", user.getBudget());
            response.put("addresses", user.getAddresses());
            response.put("preferredLanguage", user.getPreferredLanguage());
        }
        return ResponseEntity.ok(response);
    }

    // STANDARD LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        String cleanEmail = email.trim();
        String cleanPass = password.trim();

        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Account " + cleanEmail + " not found. Please click 'Sign up now' or use Quick Login."));
        }

        User user = userOpt.get();
        boolean passwordMatches = user.getPassword().equals(cleanPass);

        // Friendly presentation fallbacks for common user & demo passwords
        if (!passwordMatches) {
            String lowerEmail = cleanEmail.toLowerCase();
            if (lowerEmail.contains("sainikhil") && (cleanPass.equals("123654") || cleanPass.equals("123456") || cleanPass.equals("sainikhil") || cleanPass.equals("sainikhil0207") || cleanPass.equals("sainikhil@0207") || cleanPass.equals("password"))) {
                passwordMatches = true;
                user.setPassword(cleanPass);
                userRepository.save(user);
            } else if (lowerEmail.equals("customer@bistrobyte.com") && (cleanPass.equals("customer123") || cleanPass.equals("cust123") || cleanPass.equals("password"))) {
                passwordMatches = true;
            } else if (lowerEmail.equals("admin@bistrobyte.com") && (cleanPass.equals("admin123") || cleanPass.equals("password"))) {
                passwordMatches = true;
            } else if (lowerEmail.equals("chef@bistrobyte.com") && (cleanPass.equals("chef123") || cleanPass.equals("password"))) {
                passwordMatches = true;
            } else if (lowerEmail.equals("kitchen@bistrobyte.com") && (cleanPass.equals("kitchen123") || cleanPass.equals("password"))) {
                passwordMatches = true;
            } else if (lowerEmail.equals("delivery@bistrobyte.com") && (cleanPass.equals("delivery123") || cleanPass.equals("password"))) {
                passwordMatches = true;
            } else if (lowerEmail.equals("owner@bistrobyte.com") && (cleanPass.equals("owner123") || cleanPass.equals("password"))) {
                passwordMatches = true;
            }
        }

        if (!passwordMatches) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect password for " + cleanEmail + "."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName(), user.getRestaurantId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "SUCCESS");
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole());
        response.put("phone", user.getPhone());
        response.put("restaurantId", user.getRestaurantId());
        response.put("preferredLanguage", user.getPreferredLanguage());
        response.put("foodPreference", user.getFoodPreference());
        response.put("spiceLevel", user.getSpiceLevel());
        response.put("cuisinePreference", user.getCuisinePreference());
        response.put("budget", user.getBudget());
        response.put("addresses", user.getAddresses());
        response.put("favoriteFoods", user.getFavoriteFoods());
        response.put("allergies", user.getAllergies());
        response.put("profilePhoto", user.getProfilePhoto());

        return ResponseEntity.ok(response);
    }

    // GET CUSTOMER / USER PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestParam(required = false) String email) {
        String userEmail = email;
        if ((userEmail == null || userEmail.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                userEmail = jwtUtil.extractEmail(token);
            }
        }

        if (userEmail == null || userEmail.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required to view profile"));
        }

        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User u = userOpt.get();
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("id", u.getId());
        resp.put("name", u.getName());
        resp.put("email", u.getEmail());
        resp.put("phone", u.getPhone());
        resp.put("role", u.getRole());
        resp.put("profilePhoto", u.getProfilePhoto());
        resp.put("preferredLanguage", u.getPreferredLanguage());
        resp.put("foodPreference", u.getFoodPreference());
        resp.put("cuisinePreference", u.getCuisinePreference());
        resp.put("spiceLevel", u.getSpiceLevel());
        resp.put("budget", u.getBudget());
        resp.put("addresses", u.getAddresses());
        resp.put("favoriteFoods", u.getFavoriteFoods());
        resp.put("allergies", u.getAllergies());
        resp.put("restaurantId", u.getRestaurantId());

        return ResponseEntity.ok(resp);
    }

    // UPDATE PROFILE & TASTE PREFERENCES
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, Object> updates) {
        String userEmail = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                userEmail = jwtUtil.extractEmail(token);
            }
        }
        if (userEmail == null && updates.containsKey("email")) {
            userEmail = updates.get("email").toString();
        }

        if (userEmail == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Valid session or email required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User u = userOpt.get();
        if (updates.containsKey("name") && updates.get("name") != null) u.setName(updates.get("name").toString());
        if (updates.containsKey("phone") && updates.get("phone") != null) u.setPhone(updates.get("phone").toString());
        if (updates.containsKey("profilePhoto") && updates.get("profilePhoto") != null) u.setProfilePhoto(updates.get("profilePhoto").toString());
        if (updates.containsKey("preferredLanguage") && updates.get("preferredLanguage") != null) u.setPreferredLanguage(updates.get("preferredLanguage").toString());
        if (updates.containsKey("foodPreference") && updates.get("foodPreference") != null) u.setFoodPreference(updates.get("foodPreference").toString());
        if (updates.containsKey("cuisinePreference") && updates.get("cuisinePreference") != null) u.setCuisinePreference(updates.get("cuisinePreference").toString());
        if (updates.containsKey("spiceLevel") && updates.get("spiceLevel") != null) u.setSpiceLevel(updates.get("spiceLevel").toString());
        if (updates.containsKey("budget") && updates.get("budget") != null) u.setBudget(updates.get("budget").toString());
        if (updates.containsKey("addresses") && updates.get("addresses") != null) u.setAddresses(updates.get("addresses").toString());
        if (updates.containsKey("favoriteFoods") && updates.get("favoriteFoods") != null) u.setFavoriteFoods(updates.get("favoriteFoods").toString());
        if (updates.containsKey("allergies") && updates.get("allergies") != null) u.setAllergies(updates.get("allergies").toString());

        User saved = userRepository.save(u);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Profile updated successfully", "user", saved));
    }

    // FORGOT / RESET PASSWORD
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        Optional<User> u = userRepository.findByEmail(email);
        if (u.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found with email: " + email));
        }
        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "message", "Password reset instructions sent. Demo reset pin: 8899",
            "resetToken", "DEMO-RESET-8899"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("newPassword");
        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and newPassword are required"));
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User u = userOpt.get();
        u.setPassword(newPassword);
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Password changed successfully. Please login."));
    }

    // REGISTER CUSTOMER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        if (user.getName() == null || user.getName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered"));
        }

        user.setRole("ROLE_CUSTOMER");
        if (user.getPreferredLanguage() == null) user.setPreferredLanguage("en");
        if (user.getSpiceLevel() == null) user.setSpiceLevel("Medium");
        if (user.getFoodPreference() == null) user.setFoodPreference("Any");
        if (user.getBudget() == null) user.setBudget("Medium");
        if (user.getAddresses() == null) user.setAddresses("[{\"id\":1,\"label\":\"Home\",\"address\":\"12 Green Meadows, Main Road\"}]");

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getName());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Customer registered successfully");
        response.put("userId", saved.getId());
        response.put("email", saved.getEmail());
        response.put("name", saved.getName());
        response.put("role", saved.getRole());
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    // SEED ALL DEMO USERS FOR COMPLETE RBAC PRESENTATION
    @GetMapping("/seed-demo-users")
    public ResponseEntity<?> seedDemoUsers() {
        List<Map<String, String>> seeded = new ArrayList<>();

        record DemoDef(String name, String email, String password, String role, String phone, Long restId, String spice, String food) {}

        List<DemoDef> demos = List.of(
            new DemoDef("Platform Admin", "admin@bistrobyte.com", "password", "ROLE_ADMIN", "+1-555-0100", null, "Medium", "Any"),
            new DemoDef("Suresh Owner", "owner@bistrobyte.com", "password", "ROLE_RESTAURANT_OWNER", "+91-9876543210", 1L, "Spicy", "Non-Veg"),
            new DemoDef("Head Chef Gordon", "chef@bistrobyte.com", "password", "ROLE_CHEF", "+1-555-0101", 1L, "Spicy", "Non-Veg"),
            new DemoDef("Kitchen Lead Kiran", "kitchen@bistrobyte.com", "password", "ROLE_KITCHEN_STAFF", "+91-9876543202", 1L, "Medium", "Veg"),
            new DemoDef("Rider Suresh", "delivery@bistrobyte.com", "password", "ROLE_DELIVERY_STAFF", "+91-9876543203", 1L, "Medium", "Any"),
            new DemoDef("Alice Customer", "customer@bistrobyte.com", "password", "ROLE_CUSTOMER", "+1-555-0102", null, "Spicy", "Veg"),
            new DemoDef("Sai Nikhil", "sainikhil@bistrobyte.com", "password", "ROLE_CUSTOMER", "+91-9848012345", null, "Spicy", "Non-Veg")
        );

        for (DemoDef d : demos) {
            Optional<User> existing = userRepository.findByEmail(d.email());
            if (existing.isEmpty()) {
                User u = new User(d.name(), d.email(), d.password(), d.role(), d.phone());
                u.setRestaurantId(d.restId());
                u.setSpiceLevel(d.spice());
                u.setFoodPreference(d.food());
                u.setPreferredLanguage("en");
                u.setCuisinePreference("Andhra, South Indian");
                u.setBudget("Medium");
                u.setAddresses("[{\"id\":1,\"label\":\"Home\",\"address\":\"12 Main Campus Rd, Vaddeswaram\"},{\"id\":2,\"label\":\"Work\",\"address\":\"KL University Tech Park\"}]");
                u.setFavoriteFoods("Hyderabadi Chicken Biryani, Ghee Roast Dosa");
                userRepository.save(u);
                seeded.add(Map.of("name", d.name(), "email", d.email(), "role", d.role()));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", seeded.isEmpty() ? "Demo users already exist" : "Seeded demo users");
        result.put("seeded", seeded);
        result.put("login_hint", "Password for all seeded demo accounts is: password");
        return ResponseEntity.ok(result);
    }

    // VERIFY TOKEN
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        if (!jwtUtil.isTokenValid(token)) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Invalid or expired JWT token"));
        }

        Claims claims = jwtUtil.extractClaims(token);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("valid", true);
        res.put("subject_email", claims.getSubject());
        res.put("role", claims.get("role"));
        res.put("name", claims.get("name"));
        res.put("restaurantId", claims.get("restaurantId"));
        res.put("expiresAt", claims.getExpiration());

        return ResponseEntity.ok(res);
    }
}