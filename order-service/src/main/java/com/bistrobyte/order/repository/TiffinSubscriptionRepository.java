package com.bistrobyte.order.repository;

import com.bistrobyte.order.entity.TiffinSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TiffinSubscriptionRepository extends JpaRepository<TiffinSubscription, Long> {
    List<TiffinSubscription> findByCustomerEmail(String customerEmail);
    List<TiffinSubscription> findByRestaurantId(Long restaurantId);
}
