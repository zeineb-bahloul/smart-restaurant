package com.restaurant.smart_restaurant.controller;

import com.restaurant.smart_restaurant.model.OrderStatus;
import com.restaurant.smart_restaurant.repository.OrderRepository;
import com.restaurant.smart_restaurant.repository.ReservationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ReservationRepository reservationRepository;

    public DashboardController(OrderRepository orderRepository, ReservationRepository reservationRepository) {
        this.orderRepository = orderRepository;
        this.reservationRepository = reservationRepository;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        BigDecimal todayRevenue = orderRepository.getTodayRevenue();
        long totalOrders = orderRepository.count();
        long totalReservations = reservationRepository.count();

        Map<OrderStatus, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, (long) orderRepository.findByStatus(status).size());
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayRevenue", todayRevenue);
        stats.put("totalOrders", totalOrders);
        stats.put("totalReservations", totalReservations);
        stats.put("ordersByStatus", ordersByStatus);

        return ResponseEntity.ok(stats);
    }
}
