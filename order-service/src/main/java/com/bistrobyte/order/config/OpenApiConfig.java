package com.bistrobyte.order.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orderServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BistroByte Orders, Kitchen KDS, Payments & Reviews Service API")
                        .description("Microservice managing multi-channel ordering, real-time Kitchen Execution (KDS), table reservations, payment state machine, GST tax invoices, and verified reviews.")
                        .version("1.0.0")
                        .contact(new Contact().name("BistroByte Team").email("dev@bistrobyte.com")));
    }
}
