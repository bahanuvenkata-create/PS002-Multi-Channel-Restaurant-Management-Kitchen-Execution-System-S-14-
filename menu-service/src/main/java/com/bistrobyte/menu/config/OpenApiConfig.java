package com.bistrobyte.menu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI menuServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BistroByte Menu, Hybrid Restaurants & AI Chatbot Service API")
                        .description("Microservice managing dynamic digital menus, real GPS Haversine discovery, partner vs discovery restaurants, and multilingual BistroBot queries.")
                        .version("1.0.0")
                        .contact(new Contact().name("BistroByte Team").email("dev@bistrobyte.com")));
    }
}
