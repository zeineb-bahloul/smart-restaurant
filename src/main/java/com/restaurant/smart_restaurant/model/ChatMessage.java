package com.restaurant.smart_restaurant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Column(nullable = false)
    private String role; // "user" or "assistant"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChatMessage() {
    }

    public ChatMessage(Long id, ChatSession session, String role, String content, LocalDateTime createdAt) {
        this.id = id;
        this.session = session;
        this.role = role;
        this.content = content;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatSession getSession() {
        return session;
    }

    public void setSession(ChatSession session) {
        this.session = session;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static ChatMessageBuilder builder() {
        return new ChatMessageBuilder();
    }

    public static class ChatMessageBuilder {
        private Long id;
        private ChatSession session;
        private String role;
        private String content;
        private LocalDateTime createdAt;

        ChatMessageBuilder() {}

        public ChatMessageBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ChatMessageBuilder session(ChatSession session) {
            this.session = session;
            return this;
        }

        public ChatMessageBuilder role(String role) {
            this.role = role;
            return this;
        }

        public ChatMessageBuilder content(String content) {
            this.content = content;
            return this;
        }

        public ChatMessageBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ChatMessage build() {
            return new ChatMessage(id, session, role, content, createdAt);
        }
    }
}
