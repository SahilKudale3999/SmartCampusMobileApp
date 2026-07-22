package com.smartcampus.controller;

import com.smartcampus.dto.AttendancePercentageResponse;
import com.smartcampus.dto.AttendanceRequest;
import com.smartcampus.dto.AttendanceResponse;
import com.smartcampus.service.AttendanceService;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceResponse>> createAttendance(@Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Attendance marked", attendanceService.createAttendance(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> updateAttendance(@PathVariable Integer id, @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance updated", attendanceService.updateAttendance(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttendance(@PathVariable Integer id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance deleted", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getAttendanceById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance fetched", attendanceService.getAttendanceById(id)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance fetched", attendanceService.getAttendanceByStudent(studentId)));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceBySubject(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance fetched", attendanceService.getAttendanceBySubject(subjectId)));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance fetched", attendanceService.getAttendanceByDate(date)));
    }

    @GetMapping("/percentage")
    public ResponseEntity<ApiResponse<AttendancePercentageResponse>> getAttendancePercentage(
            @RequestParam Integer studentId,
            @RequestParam Integer subjectId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Attendance percentage fetched", attendanceService.getAttendancePercentage(studentId, subjectId)));
    }
}
