package com.bistrobyte.order.config;

import com.bistrobyte.order.entity.OrderItem;
import com.bistrobyte.order.entity.RestaurantOrder;
import com.bistrobyte.order.repository.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class OrderDataInitializer {

    @Bean
    CommandLineRunner initOrders(OrderRepository orderRepository) {
        return args -> {
            if (orderRepository.count() == 0) {
                // 1. Dine-In Order in PREPARING
                RestaurantOrder order1 = new RestaurantOrder();
                order1.setOrderNumber("BB-1021");
                order1.setCustomerName("David Miller");
                order1.setCustomerEmail("david@example.com");
                order1.setChannel("DINE_IN");
                order1.setTableNumber("Table 4");
                order1.setStatus("PREPARING");
                order1.setEstimatedPrepMinutes(18);
                order1.setCreatedAt(LocalDateTime.now().minusMinutes(12));
                order1.setUpdatedAt(LocalDateTime.now().minusMinutes(5));
                order1.addItem(new OrderItem(4L, "Woodfire Margherita Pizza", "Mains", 16.50, 1));
                order1.addItem(new OrderItem(1L, "Truffle Parm Fries", "Starters", 8.99, 1));
                order1.addItem(new OrderItem(12L, "Artisanal Berry Mojito", "Beverages", 6.50, 2));
                order1.recalculateTotal();
                orderRepository.save(order1);

                // 2. Takeaway Order in PLACED
                RestaurantOrder order2 = new RestaurantOrder();
                order2.setOrderNumber("BB-1044");
                order2.setCustomerName("Sarah Jenkins");
                order2.setCustomerEmail("sarah.j@example.com");
                order2.setChannel("TAKEAWAY");
                order2.setCustomerPhone("+1-555-4321");
                order2.setSpecialInstructions("Pickup in 20 minutes, extra ketchup please");
                order2.setStatus("PLACED");
                order2.setEstimatedPrepMinutes(15);
                order2.setCreatedAt(LocalDateTime.now().minusMinutes(3));
                order2.setUpdatedAt(LocalDateTime.now().minusMinutes(3));
                order2.addItem(new OrderItem(5L, "Smoked Wagyu Smash Burger", "Mains", 18.99, 2));
                order2.addItem(new OrderItem(10L, "Classic Venetian Tiramisu", "Desserts", 9.50, 1));
                order2.recalculateTotal();
                orderRepository.save(order2);

                // 3. Delivery Order in READY_FOR_PICKUP
                RestaurantOrder order3 = new RestaurantOrder();
                order3.setOrderNumber("BB-1088");
                order3.setCustomerName("Michael Chang");
                order3.setCustomerEmail("m.chang@example.com");
                order3.setChannel("DELIVERY");
                order3.setDeliveryAddress("Apt 4B, 742 Evergreen Terrace");
                order3.setCustomerPhone("+1-555-8899");
                order3.setSpecialInstructions("Leave at front door and ring bell");
                order3.setStatus("READY_FOR_PICKUP");
                order3.setEstimatedPrepMinutes(25);
                order3.setCreatedAt(LocalDateTime.now().minusMinutes(22));
                order3.setUpdatedAt(LocalDateTime.now().minusMinutes(2));
                order3.addItem(new OrderItem(6L, "Handmade Pappardelle Bolognese", "Mains", 21.00, 1));
                order3.addItem(new OrderItem(7L, "Pan-Seared Atlantic Salmon", "Mains", 24.50, 1));
                order3.addItem(new OrderItem(11L, "Belgian Molten Lava Cake", "Desserts", 10.50, 2));
                order3.recalculateTotal();
                orderRepository.save(order3);

                System.out.println(">>> Sample live kitchen execution orders initialized in restaurant_db!");
            }
        };
    }
}
