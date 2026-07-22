package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendancePercentageResponse {

    private Integer studentId;
    private Integer subjectId;
    private Long presentCount;
    private Long totalCount;
    private Double percentage;
}
