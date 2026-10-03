package com.bistrobyte.order.repository;

import com.bistrobyte.order.entity.RestaurantOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<RestaurantOrder, Long> {
    Optional<RestaurantOrder> findByOrderNumber(String orderNumber);
    List<RestaurantOrder> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
    List<RestaurantOrder> findByChannelOrderByCreatedAtDesc(String channel);
    List<RestaurantOrder> findAllByOrderByCreatedAtDesc();
    List<RestaurantOrder> findByCustomerEmailOrderByCreatedAtDesc(String email);
}
