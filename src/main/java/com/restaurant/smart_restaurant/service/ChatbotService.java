package com.restaurant.smart_restaurant.service;

import com.restaurant.smart_restaurant.model.ChatMessage;
import com.restaurant.smart_restaurant.model.ChatSession;
import com.restaurant.smart_restaurant.model.User;
import com.restaurant.smart_restaurant.repository.ChatMessageRepository;
import com.restaurant.smart_restaurant.repository.ChatSessionRepository;
import com.restaurant.smart_restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatbotService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ChatbotService.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${ollama.api.url:http://localhost:11434}")
    private String ollamaApiUrl;

    @Value("${ollama.model:qwen3:1.7b}")
    private String ollamaModel;

    public ChatbotService(ChatSessionRepository chatSessionRepository, ChatMessageRepository chatMessageRepository, UserRepository userRepository, WebClient.Builder webClientBuilder) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.webClientBuilder = webClientBuilder;
    }

    @Transactional
    public String chat(UUID userId, String message) {
        // 1. Récupérer ou créer la session de chat
        ChatSession session = chatSessionRepository.findFirstByUserIdOrderByStartedAtDesc(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé avec l'id : " + userId));
                    ChatSession newSession = ChatSession.builder()
                            .user(user)
                            .startedAt(LocalDateTime.now())
                            .build();
                    return chatSessionRepository.save(newSession);
                });

        // 2. Sauvegarder le message de l'utilisateur
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role("user")
                .content(message)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(userMessage);

        // 3. Charger l'historique
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());

        // 4. Préparer le payload pour Ollama
        List<Map<String, String>> messagesList = new ArrayList<>();
        
        // Ajouter le prompt système pour cadrer le comportement d'Alex
        messagesList.add(Map.of(
                "role", "system",
                "content", "Tu es Alex, assistant du restaurant Le Gourmet Smart. Tu aides les clients à consulter le menu, passer des commandes et réserver une table. Réponds en français, de façon chaleureuse et concise."
        ));
        
        for (ChatMessage msg : history) {
            messagesList.add(Map.of(
                    "role", msg.getRole(),
                    "content", msg.getContent()
            ));
        }

        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "messages", messagesList,
                "stream", false
        );

        String reply;
        try {
            WebClient webClient = webClientBuilder.build();
            Map response = webClient.post()
                    .uri(ollamaApiUrl + "/api/chat")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("message")) {
                Map messageMap = (Map) response.get("message");
                reply = (String) messageMap.get("content");
            } else {
                reply = "Désolé, je n'ai pas pu générer de réponse pour le moment.";
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'appel à Ollama", e);
            // Fallback hors-ligne en cas de problème technique
            reply = "Bonjour ! Je suis Alex, l'assistant virtuel du Gourmet Smart. Je rencontre actuellement des difficultés de connexion avec mon modèle Ollama local (" + ollamaModel + "), mais je suis là pour vous aider en mode hors-ligne. Que souhaitez-vous faire ? Consulter la carte, réserver une table ?";
        }

        // 5. Sauvegarder la réponse de l'assistant
        ChatMessage assistantMessage = ChatMessage.builder()
                .session(session)
                .role("assistant")
                .content(reply)
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(assistantMessage);

        return reply;
    }

    public List<ChatMessage> getHistory(UUID userId) {
        Optional<ChatSession> session = chatSessionRepository.findFirstByUserIdOrderByStartedAtDesc(userId);
        if (session.isEmpty()) {
            return Collections.emptyList();
        }
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.get().getId());
    }
}
