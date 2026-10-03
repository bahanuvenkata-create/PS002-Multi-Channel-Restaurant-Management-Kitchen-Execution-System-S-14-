package com.bistrobyte.order.controller;

import com.bistrobyte.order.entity.TableReservation;
import com.bistrobyte.order.repository.TableReservationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableReservationController {

    private final TableReservationRepository repository;

    public TableReservationController(TableReservationRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/reserve")
    public ResponseEntity<TableReservation> reserveTable(@RequestBody TableReservation reservation) {
        if (reservation.getReservationTime() == null) {
            reservation.setReservationTime(LocalDateTime.now().plusHours(1)); // Default +1 hour
        }
        reservation.setStatus("CONFIRMED");
        return ResponseEntity.ok(repository.save(reservation));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<TableReservation>> getRestaurantReservations(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(repository.findByRestaurantId(restaurantId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TableReservation> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return repository.findById(id).map(res -> {
            res.setStatus(status);
            return ResponseEntity.ok(repository.save(res));
        }).orElse(ResponseEntity.notFound().build());
    }
}
