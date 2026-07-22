package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponse {

    private Integer submissionId;
    private Integer assignmentId;
    private String assignmentTitle;
    private Integer studentId;
    private String studentName;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private BigDecimal gradeScore;
}
