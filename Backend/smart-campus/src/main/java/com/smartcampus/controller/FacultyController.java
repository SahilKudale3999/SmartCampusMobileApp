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

import com.smartcampus.dto.FacultyDashboardResponse;
import com.smartcampus.dto.FacultyRequest;
import com.smartcampus.dto.FacultyResponse;
import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.service.FacultyService;
import com.smartcampus.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

	private final FacultyService facultyService ;
	
	@PostMapping
	public ResponseEntity<ApiResponse<FacultyResponse>> createFaculty(@Valid @RequestBody FacultyRequest request){
	
		 return ResponseEntity.status(HttpStatus.CREATED)
	                .body(new ApiResponse<>(true, "Faculty created",facultyService.createFaculty(request)));
	}
	
	@GetMapping
    public ResponseEntity<ApiResponse<List<FacultyResponse>>> getAllFaculties() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculties fetched", facultyService.getAllFaculties()));
    }
	
	@GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponse>> getFacultyById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty fetched", facultyService.getFacultyById(id)));
    }
	
	@PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponse>> updateFaculty(@PathVariable Integer id, @Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty updated", facultyService.updateFaculty(id, request)));
    }
	
	@DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Integer id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty deleted", null));
    }
	
	@GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<FacultyResponse>> getFacultyByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty fetched", facultyService.getFacultyByDepartment(department)));
    }
	
	@GetMapping("/dashboard/{facultyId}")
	public ResponseEntity<ApiResponse<FacultyDashboardResponse>> getFacultyDashboard(@PathVariable Integer facultyId) {
	    return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard fetched", facultyService.getFacultyDashboard(facultyId)));
	}
}
