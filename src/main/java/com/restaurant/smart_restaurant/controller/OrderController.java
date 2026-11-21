package com.restaurant.smart_restaurant.controller;

import com.restaurant.smart_restaurant.dto.OrderRequestDto;
import com.restaurant.smart_restaurant.model.Order;
import com.restaurant.smart_restaurant.model.OrderStatus;
import com.restaurant.smart_restaurant.repository.UserRepository;
import com.restaurant.smart_restaurant.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"))
                .getId();
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@AuthenticationPrincipal UserDetails userDetails,
                                             @Valid @RequestBody OrderRequestDto dto) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(orderService.createOrder(userId, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Order> updateStatus(@PathVariable UUID id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }
}
