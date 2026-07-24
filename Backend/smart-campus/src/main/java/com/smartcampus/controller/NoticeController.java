package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.NoticeRequest;
import com.smartcampus.dto.NoticeResponse;
import com.smartcampus.service.NoticeService;
import com.smartcampus.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {
	
	private final NoticeService noticeService ; 
	
	  @PostMapping
	    public ResponseEntity<ApiResponse<NoticeResponse>> createNotice(
	            @Valid @RequestBody NoticeRequest request) {

	        return ResponseEntity.status(HttpStatus.CREATED)
	                .body(new ApiResponse<>(
	                        true,
	                        "Notice created successfully",
	                        noticeService.createNotice(request)));
	    }
	  
	  @GetMapping
	    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getAllNotices() {

	        return ResponseEntity.ok(
	                new ApiResponse<>(
	                        true,
	                        "Notices fetched successfully",
	                        noticeService.getAllNotices()));
	    }
	  
	  @GetMapping("/{id}")
	    public ResponseEntity<ApiResponse<NoticeResponse>> getNoticeById(
	            @PathVariable Integer id) {

	        return ResponseEntity.ok(
	                new ApiResponse<>(
	                        true,
	                        "Notice fetched successfully",
	                        noticeService.getNoticeById(id)));
	    }
	  
	  @PutMapping("/{id}")
	    public ResponseEntity<ApiResponse<NoticeResponse>> updateNotice(
	            @PathVariable Integer id,
	            @Valid @RequestBody NoticeRequest request) {

	        return ResponseEntity.ok(
	                new ApiResponse<>(
	                        true,
	                        "Notice updated successfully",
	                        noticeService.updateNotice(id, request)));
	    }
	  
	  @DeleteMapping("/{id}")
	    public ResponseEntity<ApiResponse<Void>> deleteNotice(
	            @PathVariable Integer id) {

	        noticeService.deleteNotice(id);

	        return ResponseEntity.ok(
	                new ApiResponse<>(
	                        true,
	                        "Notice deleted successfully",
	                        null));
	    }

}
