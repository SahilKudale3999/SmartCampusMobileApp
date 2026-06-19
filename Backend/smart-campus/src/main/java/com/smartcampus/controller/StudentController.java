package com.smartcampus.controller;

import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.service.StudentService;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Student created", studentService.createStudent(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Students fetched", studentService.getAllStudents()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Student fetched", studentService.getStudentById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(@PathVariable Integer id, @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Student updated", studentService.updateStudent(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Integer id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student deleted", null));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudentsByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Students fetched", studentService.getStudentsByCourse(courseId)));
    }

    @GetMapping("/roll/{rollNo}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentByRollNo(@PathVariable String rollNo) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Student fetched", studentService.getStudentByRollNo(rollNo)));
    }
}
