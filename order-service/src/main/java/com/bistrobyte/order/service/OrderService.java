package com.bistrobyte.order.service;

import com.bistrobyte.order.entity.OrderItem;
import com.bistrobyte.order.entity.RestaurantOrder;
import com.bistrobyte.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public OrderService(OrderRepository orderRepository, RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    public List<RestaurantOrder> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<RestaurantOrder> getOrdersByCustomer(String email) {
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
    }

    public Optional<RestaurantOrder> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<RestaurantOrder> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    // Active Kitchen Queue: orders that are PLACED, CONFIRMED, ACCEPTED, PREPARING, or READY_FOR_PICKUP
    public List<RestaurantOrder> getActiveKitchenOrders() {
        return orderRepository.findByStatusInOrderByCreatedAtDesc(
                List.of("PLACED", "CONFIRMED", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "READY")
        );
    }

    public List<RestaurantOrder> getOrdersByChannel(String channel) {
        return orderRepository.findByChannelOrderByCreatedAtDesc(channel.toUpperCase());
    }

    // Creates an order with Inter-Service validation to eliminate sold-out orders
    public RestaurantOrder placeOrder(RestaurantOrder orderRequest) {
        if (orderRequest.getRestaurantId() == null) {
            orderRequest.setRestaurantId(1L); // Default fallback partner
        }
        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new IllegalArgumentException("An order must contain at least one item.");
        }

        // Validate each item via Menu Service (Inter-Service Call)
        int maxPrepTime = 15;
        for (OrderItem item : orderRequest.getItems()) {
            try {
                // Call Menu Microservice via Eureka Service Discovery
                @SuppressWarnings("unchecked")
                Map<String, Object> menuResponse = restTemplate.getForObject(
                        "http://MENU-SERVICE/api/menu/check-availability?id=" + item.getMenuItemId(),
                        Map.class
                );

                if (menuResponse != null) {
                    Boolean isAvailable = (Boolean) menuResponse.get("available");
                    String itemName = (String) menuResponse.get("name");

                    if (Boolean.FALSE.equals(isAvailable)) {
                        throw new IllegalStateException("Sold-Out Item Rejected: '" +
                                (itemName != null ? itemName : item.getItemName()) +
                                "' is currently sold out and cannot be ordered.");
                    }

                    if (menuResponse.get("price") != null) {
                        item.setPrice(((Number) menuResponse.get("price")).doubleValue());
                    }
                    if (menuResponse.get("category") != null) {
                        item.setCategory((String) menuResponse.get("category"));
                    }
                    if (itemName != null) {
                        item.setItemName(itemName);
                    }
                }
            } catch (IllegalStateException e) {
                throw e; // Propagate sold-out rejection
            } catch (Exception ex) {
                System.err.println("Notice: Inter-service call to MENU-SERVICE check notice: " + ex.getMessage());
            }

            if (item.getPrice() == null || item.getPrice() <= 0) {
                item.setPrice(10.0);
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                item.setQuantity(1);
            }
            item.setSubtotal(item.getPrice() * item.getQuantity());
        }

        // Generate human-readable Order Number: BB-XXXX
        int randomCode = 1000 + new Random().nextInt(9000);
        orderRequest.setOrderNumber("BB-" + randomCode);
        orderRequest.setInvoiceNumber("INV-BB-" + randomCode);
        if (orderRequest.getStatus() == null || orderRequest.getStatus().isBlank()) {
            orderRequest.setStatus("PLACED");
        }
        orderRequest.setCreatedAt(LocalDateTime.now());
        orderRequest.setUpdatedAt(LocalDateTime.now());
        orderRequest.setEstimatedPrepMinutes(maxPrepTime);
        orderRequest.recalculateTotal();

        // Establish bidirectional relationship for cascade persistence
        for (OrderItem item : orderRequest.getItems()) {
            item.setOrder(orderRequest);
        }

        return orderRepository.save(orderRequest);
    }

    // Kitchen Execution workflow status updates
    public RestaurantOrder updateOrderStatus(Long orderId, String newStatus) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order ID " + orderId + " not found."));

        String statusFormatted = newStatus.toUpperCase().replace(" ", "_");
        order.setStatus(statusFormatted);
        order.setUpdatedAt(LocalDateTime.now());

        // Sync delivery status if appropriate
        if ("READY_FOR_PICKUP".equals(statusFormatted) || "READY".equals(statusFormatted)) {
            order.setDeliveryStatus("READY_FOR_PICKUP");
        } else if ("COMPLETED".equals(statusFormatted) || "DELIVERED".equals(statusFormatted)) {
            order.setDeliveryStatus("DELIVERED");
        }

        return orderRepository.save(order);
    }

    // Assign delivery staff
    public RestaurantOrder assignDeliveryStaff(Long orderId, Long staffId, String staffName) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order ID " + orderId + " not found."));
        order.setAssignedStaffId(staffId);
        order.setAssignedStaffName(staffName);
        order.setDeliveryStatus("ASSIGNED");
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    // Live Tracking details
    public Map<String, Object> getLiveTracking(String orderNumber) {
        RestaurantOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new NoSuchElementException("Order number " + orderNumber + " not found."));

        Map<String, Object> tracking = new LinkedHashMap<>();
        tracking.put("orderId", order.getId());
        tracking.put("orderNumber", order.getOrderNumber());
        tracking.put("restaurantId", order.getRestaurantId());
        tracking.put("restaurantName", order.getRestaurantName());
        tracking.put("channel", order.getChannel());
        tracking.put("status", order.getStatus());
        tracking.put("paymentStatus", order.getPaymentStatus());
        tracking.put("paymentMethod", order.getPaymentMethod());
        tracking.put("customerName", order.getCustomerName());
        tracking.put("customerPhone", order.getCustomerPhone());
        tracking.put("deliveryAddress", order.getDeliveryAddress());
        tracking.put("totalAmount", order.getTotalAmount());
        tracking.put("subtotalAmount", order.getSubtotalAmount());
        tracking.put("taxAmount", order.getTaxAmount());
        tracking.put("deliveryFee", order.getDeliveryFee());
        tracking.put("invoiceNumber", order.getInvoiceNumber());
        tracking.put("estimatedPrepMinutes", order.getEstimatedPrepMinutes());
        tracking.put("assignedStaffName", order.getAssignedStaffName());
        tracking.put("deliveryStatus", order.getDeliveryStatus());
        tracking.put("createdAt", order.getCreatedAt());
        tracking.put("updatedAt", order.getUpdatedAt());
        tracking.put("items", order.getItems());

        // Stepper Progress calculation (6 stages)
        int step = switch (order.getStatus()) {
            case "PLACED" -> 1;
            case "CONFIRMED", "ACCEPTED" -> 2;
            case "PREPARING" -> 3;
            case "READY_FOR_PICKUP", "READY" -> 4;
            case "ON_THE_WAY", "PICKED_UP" -> 5;
            case "COMPLETED", "DELIVERED" -> 6;
            default -> 1;
        };
        tracking.put("currentStep", step);
        tracking.put("isCompleted", "COMPLETED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus()));
        tracking.put("isCancelled", "CANCELLED".equals(order.getStatus()));

        return tracking;
    }

    // Generate Structured Digital Invoice
    public Map<String, Object> getInvoice(Long orderId) {
        RestaurantOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order ID " + orderId + " not found."));

        Map<String, Object> inv = new LinkedHashMap<>();
        inv.put("invoiceNumber", order.getInvoiceNumber() != null ? order.getInvoiceNumber() : "INV-" + order.getOrderNumber());
        inv.put("orderNumber", order.getOrderNumber());
        inv.put("orderDate", order.getCreatedAt());
        inv.put("customerName", order.getCustomerName());
        inv.put("customerEmail", order.getCustomerEmail());
        inv.put("customerPhone", order.getCustomerPhone());
        inv.put("deliveryAddress", order.getDeliveryAddress());
        inv.put("restaurantName", order.getRestaurantName());
        inv.put("paymentMethod", order.getPaymentMethod());
        inv.put("paymentStatus", order.getPaymentStatus());
        inv.put("orderStatus", order.getStatus());
        inv.put("subtotal", order.getSubtotalAmount() != null ? order.getSubtotalAmount() : (order.getTotalAmount() * 0.9));
        inv.put("tax", order.getTaxAmount() != null ? order.getTaxAmount() : (order.getTotalAmount() * 0.05));
        inv.put("deliveryFee", order.getDeliveryFee() != null ? order.getDeliveryFee() : 2.99);
        inv.put("discount", order.getDiscountAmount() != null ? order.getDiscountAmount() : 0.0);
        inv.put("totalAmount", order.getTotalAmount());
        inv.put("items", order.getItems());

        return inv;
    }
}
