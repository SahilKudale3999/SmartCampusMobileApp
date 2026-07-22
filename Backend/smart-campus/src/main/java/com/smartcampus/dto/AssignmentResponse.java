package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponse {

    private Integer assignmentId;
    private Integer subjectId;
    private String subjectName;
    private String title;
    private String description;
    private LocalDate deadline;
    private LocalDateTime createdAt;
}
