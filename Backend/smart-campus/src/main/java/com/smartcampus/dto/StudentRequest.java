package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequest {

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Course ID is required")
    private Integer courseId;

    @NotBlank(message = "Roll number is required")
    private String rollNo;
}
