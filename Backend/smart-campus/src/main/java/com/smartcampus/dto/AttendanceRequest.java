package com.smartcampus.dto;

import com.smartcampus.util.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRequest {

    @NotNull(message = "Student ID is required")
    private Integer studentId;

    @NotNull(message = "Subject ID is required")
    private Integer subjectId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;
}
