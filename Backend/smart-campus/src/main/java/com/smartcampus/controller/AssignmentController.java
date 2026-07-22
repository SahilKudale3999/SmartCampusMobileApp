package com.smartcampus.controller;

import com.smartcampus.dto.AssignmentRequest;
import com.smartcampus.dto.AssignmentResponse;
import com.smartcampus.service.AssignmentService;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Assignment created", assignmentService.createAssignment(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAllAssignments() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignments fetched", assignmentService.getAllAssignments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment fetched", assignmentService.getAssignmentById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(@PathVariable Integer id, @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment updated", assignmentService.updateAssignment(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Integer id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment deleted", null));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsBySubject(@PathVariable Integer subjectId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignments fetched", assignmentService.getAssignmentsBySubject(subjectId)));
    }
}
