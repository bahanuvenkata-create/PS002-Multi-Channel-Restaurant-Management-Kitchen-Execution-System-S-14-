package com.bistrobyte.menu.repository;

import com.bistrobyte.menu.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Haversine formula to calculate distance in km and filter within a radius
    @Query(value = "SELECT * FROM restaurants r WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(r.latitude)) * " +
           "cos(radians(r.longitude) - radians(:lon)) + " +
           "sin(radians(:lat)) * sin(radians(r.latitude)))) < :radius " +
           "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(r.latitude)) * " +
           "cos(radians(r.longitude) - radians(:lon)) + " +
           "sin(radians(:lat)) * sin(radians(r.latitude)))) ASC", nativeQuery = true)
    List<Restaurant> findNearbyRestaurants(@Param("lat") Double lat, 
                                           @Param("lon") Double lon, 
                                           @Param("radius") Double radiusKm);
}
