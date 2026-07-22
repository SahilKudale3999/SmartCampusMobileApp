package com.smartcampus.dto;

import com.smartcampus.util.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {

    private Integer attendanceId;
    private Integer studentId;
    private String studentName;
    private Integer subjectId;
    private String subjectName;
    private AttendanceStatus status;
    private LocalDate attendanceDate;
}
