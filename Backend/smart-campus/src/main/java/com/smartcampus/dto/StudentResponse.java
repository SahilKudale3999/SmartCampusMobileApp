package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Integer studentId;
    private Integer userId;
    private String fullName;
    private String email;
    private Integer courseId;
    private String courseName;
    private String rollNo;
}
