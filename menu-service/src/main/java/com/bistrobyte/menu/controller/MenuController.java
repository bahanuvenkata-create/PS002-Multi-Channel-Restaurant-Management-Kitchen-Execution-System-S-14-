package com.bistrobyte.menu.controller;

import com.bistrobyte.menu.entity.MenuItem;
import com.bistrobyte.menu.repository.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuItemRepository menuRepository;

    public MenuController(MenuItemRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    // Direct Browser URL to view all menu items
    @GetMapping("/all")
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return ResponseEntity.ok(menuRepository.findAll());
    }

    // Get menu for a specific restaurant (guarantees dishes exist for any restaurant ID)
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItem>> getMenuByRestaurantId(@PathVariable Long restaurantId) {
        List<MenuItem> items = menuRepository.findByRestaurantId(restaurantId);
        if (items.isEmpty()) {
            items = generateCuratedMenuForRestaurant(restaurantId);
        }
        return ResponseEntity.ok(items);
    }

    private List<MenuItem> generateCuratedMenuForRestaurant(Long restaurantId) {
        List<MenuItem> list = new ArrayList<>();
        list.add(new MenuItem(
                "Special Andhra Veg Thali Meals", "Mains", 180.0,
                "Unlimited Sona Masoori rice, Tomato Dal, Gongura pickle, Sambhar, Rasam, Curd, and crisp appadam.",
                true, 15, "Veg", 1,
                "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Lunch", "Andhra"
        ));
        list.add(new MenuItem(
                "Gongura Mutton Dum Biryani", "Biryanis", 360.0,
                "Tender local mutton slow-cooked with fresh Gongura greens and aged basmati rice.",
                true, 25, "Non-Veg", 3,
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Lunch", "Andhra"
        ));
        list.add(new MenuItem(
                "Hyderabadi Chicken Dum Biryani", "Biryanis", 280.0,
                "Richly spiced kacchi dum biryani served with Mirchi Ka Salan and creamy Raita.",
                true, 20, "Non-Veg", 2,
                "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Dinner", "Hyderabadi"
        ));
        list.add(new MenuItem(
                "Ghee Podi Roast Masala Dosa", "Tiffin", 95.0,
                "Crispy golden crepe smeared with aromatic Karampodi and pure ghee with potato masala.",
                true, 10, "Veg", 2,
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Tiffin", "South Indian"
        ));
        list.add(new MenuItem(
                "Pesarattu Upma Combo", "Tiffin", 110.0,
                "Whole moong dal dosa stuffed with hot ginger-tempered upma and allam pachadi.",
                true, 12, "Veg", 1,
                "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Tiffin", "Andhra"
        ));
        list.add(new MenuItem(
                "Andhra Mirchi Bajji with Onions", "Snacks", 70.0,
                "Golden batter fried green chilies stuffed with cumin-lemon powder and topped with onions.",
                true, 10, "Veg", 2,
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Snacks", "Andhra"
        ));
        list.add(new MenuItem(
                "Paneer Butter Masala with 2 Naan", "Mains", 240.0,
                "Fresh cottage cheese cubes in silky makhani gravy served with soft butter naans.",
                true, 15, "Veg", 1,
                "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Dinner", "North Indian"
        ));
        list.add(new MenuItem(
                "Degree Filter Coffee", "Beverages", 40.0,
                "Traditional brass dabarah-tumbler chicory brewed dark roast coffee with frothy milk.",
                true, 5, "Veg", 0,
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Snacks", "South Indian"
        ));
        list.add(new MenuItem(
                "Gulab Jamun with Rabdi", "Dessert", 85.0,
                "Hot khoya gulab jamuns served over chilled saffron-infused thick rabdi.",
                true, 5, "Veg", 0,
                "https://images.unsplash.com/photo-1605197148560-eb0df39a3ea7?w=600&auto=format&fit=crop&q=80",
                restaurantId, "Dinner", "Indian"
        ));
        try {
            return menuRepository.saveAll(list);
        } catch (Exception e) {
            return list;
        }
    }

    // Direct Browser URL to view available (in-stock) items for customer ordering
    @GetMapping("/available")
    public ResponseEntity<List<MenuItem>> getAvailableMenuItems() {
        return ResponseEntity.ok(menuRepository.findByIsAvailableTrue());
    }

    // Direct Browser URL to filter by category: /api/menu/category?name=Mains
    @GetMapping("/category")
    public ResponseEntity<List<MenuItem>> getByCategory(@RequestParam String name) {
        return ResponseEntity.ok(menuRepository.findByCategory(name));
    }

    // Direct Browser URL to view a specific dish by ID: /api/menu/1
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(@PathVariable Long id) {
        return menuRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Inter-Service Communication Endpoint: Called by Order Service to prevent ordering sold-out dishes
    @GetMapping("/check-availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(@RequestParam Long id) {
        Optional<MenuItem> itemOpt = menuRepository.findById(id);
        Map<String, Object> result = new LinkedHashMap<>();

        if (itemOpt.isEmpty()) {
            result.put("found", false);
            result.put("available", false);
            result.put("message", "Menu item with ID " + id + " does not exist");
            return ResponseEntity.status(404).body(result);
        }

        MenuItem item = itemOpt.get();
        result.put("found", true);
        result.put("id", item.getId());
        result.put("name", item.getName());
        result.put("price", item.getPrice());
        result.put("category", item.getCategory());
        result.put("available", item.getIsAvailable());
        result.put("message", item.getIsAvailable() ? "Item is in stock and available" : "ITEM IS SOLD OUT");
        return ResponseEntity.ok(result);
    }

    // Direct Browser URL to toggle availability without Postman: /api/menu/toggle-availability?id=1
    @GetMapping("/toggle-availability")
    public ResponseEntity<?> toggleAvailabilityQuick(@RequestParam Long id) {
        Optional<MenuItem> itemOpt = menuRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Menu item not found"));
        }

        MenuItem item = itemOpt.get();
        item.setIsAvailable(!item.getIsAvailable());
        MenuItem updated = menuRepository.save(item);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("id", updated.getId());
        res.put("name", updated.getName());
        res.put("isAvailable", updated.getIsAvailable());
        res.put("message", updated.getIsAvailable() ? "Dish marked AVAILABLE" : "Dish marked SOLD OUT");
        return ResponseEntity.ok(res);
    }

    // Direct Browser URL to quickly create a dish without Postman:
    // /api/menu/quick-create?name=Spicy+Wings&category=Starters&price=11.50&desc=Crispy+wings
    @GetMapping("/quick-create")
    public ResponseEntity<?> quickCreateDish(
            @RequestParam String name,
            @RequestParam(defaultValue = "Mains") String category,
            @RequestParam(defaultValue = "15.00") Double price,
            @RequestParam(defaultValue = "Delicious chef prepared dish") String desc,
            @RequestParam(defaultValue = "Veg") String dietaryType) {

        MenuItem item = new MenuItem(
                name, category, price, desc, true, 15, dietaryType, 1,
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
                1L, "Any", "Generic"
        );
        MenuItem saved = menuRepository.save(item);
        return ResponseEntity.ok(Map.of("status", "CREATED", "item", saved));
    }

    // Standard REST POST for creating dish
    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem item) {
        if (item.getIsAvailable() == null) {
            item.setIsAvailable(true);
        }
        if (item.getImageUrl() == null || item.getImageUrl().isEmpty()) {
            item.setImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80");
        }
        MenuItem saved = menuRepository.save(item);
        return ResponseEntity.ok(saved);
    }

    // Standard REST PUT for updating dish
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updated) {
        return menuRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setCategory(updated.getCategory());
            existing.setPrice(updated.getPrice());
            existing.setDescription(updated.getDescription());
            if (updated.getIsAvailable() != null) {
                existing.setIsAvailable(updated.getIsAvailable());
            }
            if (updated.getPrepTimeMinutes() != null) {
                existing.setPrepTimeMinutes(updated.getPrepTimeMinutes());
            }
            if (updated.getDietaryType() != null) {
                existing.setDietaryType(updated.getDietaryType());
            }
            if (updated.getSpicyLevel() != null) {
                existing.setSpicyLevel(updated.getSpicyLevel());
            }
            if (updated.getImageUrl() != null && !updated.getImageUrl().isEmpty()) {
                existing.setImageUrl(updated.getImageUrl());
            }
            return ResponseEntity.ok(menuRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Update availability toggle via REST PUT
    @PutMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestParam Boolean available) {
        return menuRepository.findById(id).map(item -> {
            item.setIsAvailable(available);
            menuRepository.save(item);
            return ResponseEntity.ok(Map.of(
                    "id", id,
                    "name", item.getName(),
                    "isAvailable", available,
                    "message", available ? "Item is now available" : "Item marked as sold out"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete dish
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        if (!menuRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        menuRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Menu item deleted successfully", "id", id));
    }
}
