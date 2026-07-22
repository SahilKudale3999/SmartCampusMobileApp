package com.smartcampus.controller;

import com.smartcampus.dto.SubmissionRequest;
import com.smartcampus.dto.SubmissionResponse;
import com.smartcampus.service.SubmissionService;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitAssignment(@Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Assignment submitted", submissionService.submitAssignment(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getAllSubmissions() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submissions fetched", submissionService.getAllSubmissions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submission fetched", submissionService.getSubmissionById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> updateSubmission(@PathVariable Integer id, @Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submission updated", submissionService.updateSubmission(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubmission(@PathVariable Integer id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Submission deleted", null));
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByAssignment(@PathVariable Integer assignmentId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submissions fetched", submissionService.getSubmissionsByAssignment(assignmentId)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submissions fetched", submissionService.getSubmissionsByStudent(studentId)));
    }

    @PatchMapping("/{id}/grade")
    public ResponseEntity<ApiResponse<SubmissionResponse>> gradeSubmission(@PathVariable Integer id, @RequestParam BigDecimal grade) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submission graded", submissionService.gradeSubmission(id, grade)));
    }
}
