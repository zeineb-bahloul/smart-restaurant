package com.restaurant.smart_restaurant.controller;

import com.restaurant.smart_restaurant.dto.ChatRequestDto;
import com.restaurant.smart_restaurant.dto.ChatResponseDto;
import com.restaurant.smart_restaurant.model.ChatMessage;
import com.restaurant.smart_restaurant.repository.UserRepository;
import com.restaurant.smart_restaurant.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    public ChatbotController(ChatbotService chatbotService, UserRepository userRepository) {
        this.chatbotService = chatbotService;
        this.userRepository = userRepository;
    }

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"))
                .getId();
    }

    @PostMapping
    public ResponseEntity<ChatResponseDto> chat(@AuthenticationPrincipal UserDetails userDetails,
                                                @Valid @RequestBody ChatRequestDto dto) {
        UUID userId = getUserId(userDetails);
        String reply = chatbotService.chat(userId, dto.getMessage());
        return ResponseEntity.ok(new ChatResponseDto(reply));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(chatbotService.getHistory(userId));
    }
}
