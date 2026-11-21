package com.restaurant.smart_restaurant.service;

import com.restaurant.smart_restaurant.dto.OrderItemDto;
import com.restaurant.smart_restaurant.dto.OrderRequestDto;
import com.restaurant.smart_restaurant.model.*;
import com.restaurant.smart_restaurant.repository.MenuItemRepository;
import com.restaurant.smart_restaurant.repository.OrderRepository;
import com.restaurant.smart_restaurant.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, MenuItemRepository menuItemRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(UUID userId, OrderRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'id : " + userId));

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .note(dto.getNote())
                .items(new ArrayList<>())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemDto itemDto : dto.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemDto.getMenuItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Plat non trouvé avec l'id : " + itemDto.getMenuItemId()));

            if (!menuItem.isAvailable()) {
                throw new IllegalStateException("Le plat " + menuItem.getName() + " n'est pas disponible actuellement.");
            }

            BigDecimal itemTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setTotal(total);

        return orderRepository.save(order);
    }

    public List<Order> getMyOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Commande non trouvée avec l'id : " + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
