package com.smartcampus.controller;


import com.smartcampus.dto.ChatRequest;
import com.smartcampus.dto.ChatResponse;
import com.smartcampus.service.ChatbotService;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

	
	private final ChatbotService chatbotService;
	
	  @PostMapping("/ask")
	    public ResponseEntity<ApiResponse<ChatResponse>> ask(@Valid @RequestBody ChatRequest request) {
	        String answer = chatbotService.getResponse(request.getMessage(), request.getUserId());
	        return ResponseEntity.ok(
	                new ApiResponse<>(true, "Response generated successfully", new ChatResponse(answer)));
	    }
}
