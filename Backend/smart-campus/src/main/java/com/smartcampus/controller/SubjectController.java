package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.dto.SubjectRequest;
import com.smartcampus.dto.SubjectResponse;
import com.smartcampus.service.StudentService;
import com.smartcampus.service.SubjectService;
import com.smartcampus.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/subject")
@RequiredArgsConstructor
public class SubjectController {

	private final SubjectService subjectService;
	
	@PostMapping
    public ResponseEntity<ApiResponse<SubjectResponse>> createSubject(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Subject created", subjectService.createSubject(request)));
    }
	
	@GetMapping
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getAllSubjects() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subjects fetched",subjectService.getAllSubjects()));
    }
	
	@GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> getSubjectById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subject fetched", subjectService.getSubjectById(id)));
    }
	
	@PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> updateSubject(@PathVariable Integer id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subject updated", subjectService.updateSubject(id, request)));
    }
	
	@DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Integer id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Subject deleted", null));
    }
	
	@GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getSubjectsByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subject fetched", subjectService.getSubjectsByCourse(courseId)));
    }
	
	@GetMapping("/faculty/{facultyId}")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getSubjectsByfaculty(@PathVariable Integer facultyId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subject fetched", subjectService.getSubjectsByFaculty(facultyId)));
    }
}
