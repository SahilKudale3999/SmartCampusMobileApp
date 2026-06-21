package com.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyRequest {

	
	@NotNull(message = "User ID is required")
	private Integer userId;
	
	@NotNull(message = "Department Name is required")
	private String department;
}
