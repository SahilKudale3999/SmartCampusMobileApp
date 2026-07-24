package com.smartcampus.dto;

import java.time.LocalDateTime;

import com.smartcampus.util.Role;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeRequest {


	 @NotBlank(message = "Title is required")
	 private String title;

	 @NotBlank(message = "Description is required")
	 private String description;

     private Integer createdBy;

     
    
    
}
