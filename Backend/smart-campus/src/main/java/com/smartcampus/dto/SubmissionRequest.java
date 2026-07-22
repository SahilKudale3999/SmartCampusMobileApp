package com.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRequest {

    @NotNull(message = "Assignment ID is required")
    private Integer assignmentId;

    @NotNull(message = "Student ID is required")
    private Integer studentId;

    private String fileUrl;

    private BigDecimal gradeScore;
}
