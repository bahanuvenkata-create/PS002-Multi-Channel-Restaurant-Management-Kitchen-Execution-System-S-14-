package com.bistrobyte.order.controller;

import com.bistrobyte.order.entity.TiffinSubscription;
import com.bistrobyte.order.repository.TiffinSubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tiffins")
public class TiffinSubscriptionController {

    private final TiffinSubscriptionRepository repository;

    public TiffinSubscriptionController(TiffinSubscriptionRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<TiffinSubscription> createSubscription(@RequestBody TiffinSubscription subscription) {
        subscription.setStatus("ACTIVE");
        TiffinSubscription saved = repository.save(subscription);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/customer/{email}")
    public ResponseEntity<List<TiffinSubscription>> getCustomerSubscriptions(@PathVariable String email) {
        return ResponseEntity.ok(repository.findByCustomerEmail(email));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<TiffinSubscription>> getRestaurantSubscriptions(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(repository.findByRestaurantId(restaurantId));
    }
}
