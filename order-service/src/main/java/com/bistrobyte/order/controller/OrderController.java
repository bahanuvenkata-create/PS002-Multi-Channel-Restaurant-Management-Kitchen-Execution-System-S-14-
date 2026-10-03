package com.bistrobyte.order.controller;

import com.bistrobyte.order.entity.OrderItem;
import com.bistrobyte.order.entity.RestaurantOrder;
import com.bistrobyte.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // List all orders (Platform admin / kitchen)
    @GetMapping("/all")
    public ResponseEntity<List<RestaurantOrder>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Customer's order history: /api/orders/my?email=alice@bistrobyte.com
    @GetMapping("/my")
    public ResponseEntity<List<RestaurantOrder>> getMyOrders(@RequestParam(required = false) String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(orderService.getAllOrders());
        }
        return ResponseEntity.ok(orderService.getOrdersByCustomer(email));
    }

    // Specific order by ID: /api/orders/1
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Active Kitchen Queue: /api/orders/kitchen/active
    @GetMapping("/kitchen/active")
    public ResponseEntity<List<RestaurantOrder>> getActiveKitchenOrders() {
        return ResponseEntity.ok(orderService.getActiveKitchenOrders());
    }

    // Live Order Tracking: /api/orders/track?orderNumber=BB-1021
    @GetMapping("/track")
    public ResponseEntity<?> trackOrder(@RequestParam String orderNumber) {
        try {
            return ResponseEntity.ok(orderService.getLiveTracking(orderNumber));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // Structured Digital Invoice: /api/orders/{id}/invoice
    @GetMapping("/{id}/invoice")
    public ResponseEntity<?> getOrderInvoice(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getInvoice(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // Filter by channel: /api/orders/channel?type=DINE_IN
    @GetMapping("/channel")
    public ResponseEntity<List<RestaurantOrder>> getByChannel(@RequestParam String type) {
        return ResponseEntity.ok(orderService.getOrdersByChannel(type));
    }

    // Kitchen Status transition via GET (convenient direct testing)
    @GetMapping("/update-status-get")
    public ResponseEntity<?> updateStatusViaGet(@RequestParam Long orderId, @RequestParam String status) {
        try {
            RestaurantOrder updated = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "orderNumber", updated.getOrderNumber(),
                    "newStatus", updated.getStatus(),
                    "updatedAt", updated.getUpdatedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Quick Dine-In order
    @GetMapping("/quick-create-dinein")
    public ResponseEntity<?> quickCreateDineIn(
            @RequestParam(defaultValue = "Table 7") String table,
            @RequestParam(defaultValue = "Walk-in Guest") String customer) {

        RestaurantOrder order = new RestaurantOrder();
        order.setChannel("DINE_IN");
        order.setTableNumber(table);
        order.setCustomerName(customer);
        order.setCustomerEmail(customer.toLowerCase().replace(" ", "") + "@guest.com");
        order.addItem(new OrderItem(4L, "Woodfire Margherita Pizza", "Mains", 16.50, 1));
        order.addItem(new OrderItem(1L, "Truffle Parm Fries", "Starters", 8.99, 1));

        try {
            RestaurantOrder placed = orderService.placeOrder(order);
            return ResponseEntity.ok(Map.of(
                    "status", "ORDER_PLACED",
                    "orderNumber", placed.getOrderNumber(),
                    "totalAmount", placed.getTotalAmount(),
                    "kitchenStatus", placed.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Standard POST order creation
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody RestaurantOrder order) {
        try {
            RestaurantOrder placed = orderService.placeOrder(order);
            return ResponseEntity.ok(placed);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of(
                    "error", "SOLD_OUT_ERROR",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Standard PUT status update (Kitchen accept, start preparing, mark ready, deliver)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            RestaurantOrder updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Assign delivery rider
    @PutMapping("/{id}/assign-delivery")
    public ResponseEntity<?> assignDelivery(@PathVariable Long id, @RequestParam Long staffId, @RequestParam String staffName) {
        try {
            RestaurantOrder updated = orderService.assignDeliveryStaff(id, staffId, staffName);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
