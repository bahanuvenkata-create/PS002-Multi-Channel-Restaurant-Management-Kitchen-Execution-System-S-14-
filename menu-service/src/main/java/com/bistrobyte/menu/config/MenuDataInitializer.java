package com.bistrobyte.menu.config;

import com.bistrobyte.menu.entity.MenuItem;
import com.bistrobyte.menu.entity.Restaurant;
import com.bistrobyte.menu.repository.MenuItemRepository;
import com.bistrobyte.menu.repository.RestaurantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class MenuDataInitializer {

    @Bean
    CommandLineRunner initMenu(MenuItemRepository menuRepository, RestaurantRepository restaurantRepository) {
        return args -> {
            if (restaurantRepository.count() > 0) {
                System.out.println(">>> Digital Menu already seeded with " + restaurantRepository.count() + " partner restaurants.");
                return;
            }

            // Create BistroByte Partner Restaurants
            Restaurant r1 = new Restaurant(
                "Spice Route Andhra Kitchen", "Authentic premium Andhra and South Indian cuisine with traditional spices.", "Near KL University, Vaddeswaram",
                16.4450, 80.6250, 4.8, 480, "Andhra • South Indian", "11:00 AM", "11:00 PM", "25-35 mins", 150.0, 30.0, false, "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80", true
            );
            r1.setPartnerStatus("PARTNER");
            r1.setExternalPlaceId("partner_bb_01");
            r1.setPriceLevel(2);

            Restaurant r2 = new Restaurant(
                "Sri Krishna Tiffin House", "Best morning tiffins, crispy dosas, and pure ghee vegetarian delights.", "Tadepalle Bypass Highway",
                16.4380, 80.6150, 4.9, 1250, "South Indian • Pure Veg", "06:30 AM", "03:30 PM", "15-25 mins", 100.0, 20.0, true, "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", true
            );
            r2.setPartnerStatus("PARTNER");
            r2.setExternalPlaceId("partner_bb_02");
            r2.setPriceLevel(1);

            Restaurant r3 = new Restaurant(
                "Cafe Bistro Woodfire", "Artisan woodfire sourdough pizzas, continental bites and specialty coffee.", "Benz Circle, Vijayawada",
                16.5000, 80.6300, 4.6, 840, "Italian • Continental", "10:00 AM", "10:30 PM", "30-40 mins", 200.0, 45.0, false, "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80", true
            );
            r3.setPartnerStatus("PARTNER");
            r3.setExternalPlaceId("partner_bb_03");
            r3.setPriceLevel(2);

            Restaurant r4 = new Restaurant(
                "Punjabi Dhaba & Tandoor", "Rich butter gravies, dal makhani, stuffed kulchas and tandoori specials.", "MG Road, Vijayawada",
                16.5050, 80.6400, 4.7, 690, "North Indian • Punjabi", "12:00 PM", "11:30 PM", "25-35 mins", 180.0, 35.0, false, "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80", true
            );
            r4.setPartnerStatus("PARTNER");
            r4.setExternalPlaceId("partner_bb_04");
            r4.setPriceLevel(2);

            restaurantRepository.saveAll(List.of(r1, r2, r3, r4));

            Long spiceRouteId = r1.getId();
            Long tiffinHouseId = r2.getId();
            Long cafeBistroId = r3.getId();
            Long punjabiId = r4.getId();

            List<MenuItem> items = List.of(
                    // --- SPICE ROUTE (r1) ---
                    new MenuItem("Andhra Special Veg Meals", "Mains", 12.50, "Unlimited traditional meal with Pappu, Sambar, Rasam, Curd, Kandi Podi and Ghee.", true, 15, "Veg", 2, "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", spiceRouteId, "Lunch", "Andhra"),
                    new MenuItem("Hyderabadi Chicken Dum Biryani", "Mains", 19.50, "Fragrant aged basmati rice slow-cooked with marinated farm chicken and royal spices.", true, 25, "Non-Veg", 2, "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&auto=format&fit=crop&q=80", spiceRouteId, "Lunch", "Andhra"),
                    new MenuItem("Gongura Mutton Biryani", "Chef Specials", 24.00, "Tender mutton pieces simmered in tangy Andhra Gongura leaf gravy and fragrant rice.", true, 25, "Non-Veg", 3, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80", spiceRouteId, "Dinner", "Andhra"),
                    new MenuItem("Chettinad Spicy Chicken", "Mains", 18.50, "Fiery peppery South Indian chicken curry made with fresh roasted ground spices.", true, 20, "Non-Veg", 3, "https://images.unsplash.com/photo-1589302168068-94022a16c70b?w=600&auto=format&fit=crop&q=80", spiceRouteId, "Dinner", "South Indian"),
                    new MenuItem("Gobi 65 (Cauliflower Fry)", "Starters", 8.50, "Crispy fried cauliflower florets tossed in curry leaves, green chillies and lemon.", true, 12, "Veg", 1, "https://images.unsplash.com/photo-1625398407796-a29b2ff11504?w=600&auto=format&fit=crop&q=80", spiceRouteId, "Snacks", "South Indian"),
                    new MenuItem("Royal Mysore Pak", "Desserts", 6.50, "Melt-in-mouth traditional sweet made of pure cow ghee and roasted gram flour.", true, 5, "Veg", 0, "https://images.unsplash.com/photo-1634032115162-dcb3232c74fb?w=600&auto=format&fit=crop&q=80", spiceRouteId, "Any", "South Indian"),

                    // --- SRI KRISHNA TIFFIN HOUSE (r2) ---
                    new MenuItem("Ghee Podi Roast Dosa", "Mains", 8.50, "Crispy golden crepe smeared with aromatic spicy karam podi and melted ghee.", true, 10, "Veg", 2, "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", tiffinHouseId, "Tiffin", "South Indian"),
                    new MenuItem("Pesarattu Upma Special", "Mains", 9.00, "Traditional Andhra whole green gram dosa stuffed with seasoned semolina upma.", true, 12, "Veg", 1, "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&auto=format&fit=crop&q=80", tiffinHouseId, "Tiffin", "Andhra"),
                    new MenuItem("Steamed Button Idli (14 pcs)", "Starters", 6.50, "Mini idlis dunked in hot aromatic drumstick sambar and topped with fresh ghee.", true, 8, "Veg", 0, "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&auto=format&fit=crop&q=80", tiffinHouseId, "Tiffin", "South Indian"),
                    new MenuItem("Crispy Medu Vada (2 pcs)", "Starters", 5.50, "Crunchy fried lentil doughnuts served with coconut and ginger chutneys.", true, 8, "Veg", 0, "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80", tiffinHouseId, "Tiffin", "South Indian"),
                    new MenuItem("Madras Degree Filter Kaapi", "Beverages", 3.50, "Authentic chicory blend brewed coffee served frothy in traditional brass tumbler.", true, 5, "Veg", 0, "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=600&auto=format&fit=crop&q=80", tiffinHouseId, "Any", "South Indian"),

                    // --- CAFE BISTRO (r3) ---
                    new MenuItem("Woodfire Margherita Pizza", "Mains", 16.50, "San Marzano plum tomato sauce, Fior di Latte mozzarella and fresh basil leaves.", true, 15, "Veg", 0, "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80", cafeBistroId, "Lunch", "Italian"),
                    new MenuItem("Smoked Wagyu Smash Burger", "Mains", 18.99, "Double prime beef patties, aged English cheddar, caramelized onion relish.", true, 18, "Non-Veg", 1, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", cafeBistroId, "Dinner", "Continental"),
                    new MenuItem("Truffle Parm Handcut Fries", "Starters", 8.99, "Crisp Idaho potatoes tossed in white truffle oil, sea salt and freshly grated parmesan.", true, 10, "Veg", 0, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80", cafeBistroId, "Snacks", "Continental"),
                    new MenuItem("Classic Venetian Tiramisu", "Desserts", 9.50, "Espresso-soaked Savoiardi ladyfingers, rich mascarpone cream and Valrhona cocoa.", true, 5, "Veg", 0, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80", cafeBistroId, "Any", "Italian"),

                    // --- PUNJABI DHABA (r4) ---
                    new MenuItem("Dal Makhani Bukhara Style", "Mains", 13.50, "Black lentils slow-cooked overnight over tandoor charcoal with butter and cream.", true, 15, "Veg", 0, "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", punjabiId, "Lunch", "North Indian"),
                    new MenuItem("Butter Chicken Masala", "Mains", 17.50, "Charcoal-grilled tandoori chicken cooked in rich satin-smooth tomato and cashew gravy.", true, 18, "Non-Veg", 1, "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80", punjabiId, "Dinner", "North Indian"),
                    new MenuItem("Garlic Butter Naan (2 pcs)", "Starters", 4.50, "Fresh pillowy naan baked on tandoor wall brushed with roasted garlic and butter.", true, 8, "Veg", 0, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80", punjabiId, "Any", "North Indian"),
                    new MenuItem("Paneer Tikka Angara", "Starters", 14.00, "Malai paneer cubes marinated in yogurt and degi mirch roasted in clay oven.", true, 15, "Veg", 1, "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&auto=format&fit=crop&q=80", punjabiId, "Snacks", "North Indian")
            );

            menuRepository.saveAll(items);
            System.out.println(">>> Digital Menu seeded with " + restaurantRepository.count() + " partner restaurants and " + items.size() + " authentic dishes!");
        };
    }
}
