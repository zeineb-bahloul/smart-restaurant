package com.restaurant.smart_restaurant.repository;

import com.restaurant.smart_restaurant.model.Order;
import com.restaurant.smart_restaurant.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.createdAt >= CURRENT_DATE AND o.status != 'CANCELLED'")
    BigDecimal getTodayRevenue();
}
