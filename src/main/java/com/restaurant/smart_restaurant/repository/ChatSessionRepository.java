package com.restaurant.smart_restaurant.repository;

import com.restaurant.smart_restaurant.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {
    Optional<ChatSession> findFirstByUserIdOrderByStartedAtDesc(UUID userId);
}
