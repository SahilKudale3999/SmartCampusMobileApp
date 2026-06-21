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
public class SubjectRequest {

	@NotNull(message = "Subject name is required")
	private String subjectName;
	
	@NotNull(message = "Course Id is required")
	private Integer courseId;
	
	@NotNull(message = "Faculty Id is required")
	private Integer facultyId;
}
