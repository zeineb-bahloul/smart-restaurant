package com.restaurant.smart_restaurant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_sessions")
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    public ChatSession() {
    }

    public ChatSession(UUID id, User user, LocalDateTime startedAt) {
        this.id = id;
        this.user = user;
        this.startedAt = startedAt != null ? startedAt : LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public static ChatSessionBuilder builder() {
        return new ChatSessionBuilder();
    }

    public static class ChatSessionBuilder {
        private UUID id;
        private User user;
        private LocalDateTime startedAt;

        ChatSessionBuilder() {}

        public ChatSessionBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public ChatSessionBuilder user(User user) {
            this.user = user;
            return this;
        }

        public ChatSessionBuilder startedAt(LocalDateTime startedAt) {
            this.startedAt = startedAt;
            return this;
        }

        public ChatSession build() {
            return new ChatSession(id, user, startedAt);
        }
    }
}
