package com.bistrobyte.menu.repository;

import com.bistrobyte.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByCategory(String category);
    List<MenuItem> findByIsAvailableTrue();
    List<MenuItem> findByCategoryAndIsAvailableTrue(String category);
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByMealType(String mealType);
    List<MenuItem> findByCuisineType(String cuisineType);
    List<MenuItem> findByDietaryType(String dietaryType);
}
