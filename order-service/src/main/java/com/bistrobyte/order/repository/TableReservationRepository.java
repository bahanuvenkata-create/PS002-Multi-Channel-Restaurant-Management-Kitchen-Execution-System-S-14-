package com.bistrobyte.order.repository;

import com.bistrobyte.order.entity.TableReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TableReservationRepository extends JpaRepository<TableReservation, Long> {
    List<TableReservation> findByRestaurantId(Long restaurantId);
    List<TableReservation> findByRestaurantIdAndStatus(Long restaurantId, String status);
}
