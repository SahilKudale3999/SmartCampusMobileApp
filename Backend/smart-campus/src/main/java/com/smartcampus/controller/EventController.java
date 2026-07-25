package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.dto.EventRequest;
import com.smartcampus.dto.EventResponse;
import com.smartcampus.service.EventService;
import com.smartcampus.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/event")
@RequiredArgsConstructor
public class EventController {

	
	 private final EventService eventService;
	 
	 @PostMapping
	    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@Valid @RequestBody EventRequest request) {
	        return ResponseEntity.status(HttpStatus.CREATED)
	                .body(new ApiResponse<>(true, "Event created successfully", eventService.createEvent(request)));
	    }
	 
	 @GetMapping
	    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
	        return ResponseEntity.ok(
	                new ApiResponse<>(true, "Events fetched successfully", eventService.getAllEvents()));
	    }
	 
	 @GetMapping("/upcoming")
	    public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcomingEvents() {
	        return ResponseEntity.ok(
	                new ApiResponse<>(true, "Upcoming events fetched successfully", eventService.getUpcomingEvents()));
	    }
	 
	 @GetMapping("/{id}")
	    public ResponseEntity<ApiResponse<EventResponse>> getEventById( @PathVariable Integer id) {
	        return ResponseEntity.ok(
	                new ApiResponse<>(true,"Event fetched successfully",eventService.getEventById(id)));
	    }
	 
	 @PutMapping("/{id}")
	    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(@PathVariable Integer id,@Valid @RequestBody EventRequest request) {
	        return ResponseEntity.ok(
	                new ApiResponse<>(true,"Event updated successfully",eventService.updateEvent(id, request)));
	    }
	 
	 @DeleteMapping("/{id}")
	    public ResponseEntity<ApiResponse<Void>> deleteEvent( @PathVariable Integer id) {
	        eventService.deleteEvent(id);
	        return ResponseEntity.ok(
	                new ApiResponse<>(true,"Event deleted successfully",null));
	    }
}
