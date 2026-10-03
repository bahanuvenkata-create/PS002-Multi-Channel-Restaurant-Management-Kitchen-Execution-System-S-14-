package com.bistrobyte.auth.config;

import com.bistrobyte.auth.entity.User;
import com.bistrobyte.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User(
                        "Restaurant Admin",
                        "admin@bistrobyte.com",
                        "admin123",
                        "ROLE_ADMIN",
                        "+1-555-0100"
                ));
                userRepository.save(new User(
                        "Head Chef Gordon",
                        "chef@bistrobyte.com",
                        "chef123",
                        "ROLE_KITCHEN_STAFF",
                        "+1-555-0101"
                ));
                userRepository.save(new User(
                        "Alice Customer",
                        "customer@bistrobyte.com",
                        "cust123",
                        "ROLE_CUSTOMER",
                        "+1-555-0102"
                ));
                System.out.println(">>> Demo users initialized in restaurant_db successfully!");
            }
        };
    }
}
