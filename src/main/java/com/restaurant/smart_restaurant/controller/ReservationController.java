package com.restaurant.smart_restaurant.controller;

import com.restaurant.smart_restaurant.dto.ReservationDto;
import com.restaurant.smart_restaurant.model.Reservation;
import com.restaurant.smart_restaurant.repository.UserRepository;
import com.restaurant.smart_restaurant.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    public ReservationController(ReservationService reservationService, UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"))
                .getId();
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@AuthenticationPrincipal UserDetails userDetails,
                                              @Valid @RequestBody ReservationDto dto) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(reservationService.create(userId, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Reservation>> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(reservationService.getMyReservations(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reservation>> getAll() {
        return ResponseEntity.ok(reservationService.getAll());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Reservation> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(reservationService.updateStatus(id, status));
    }
}
