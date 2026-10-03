package com.bistrobyte.auth.repository;

import com.bistrobyte.auth.entity.RestaurantStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantStaffRepository extends JpaRepository<RestaurantStaff, Long> {
    List<RestaurantStaff> findByRestaurantId(Long restaurantId);
    Optional<RestaurantStaff> findByEmail(String email);
    boolean existsByEmail(String email);
    List<RestaurantStaff> findByRole(String role);
}
