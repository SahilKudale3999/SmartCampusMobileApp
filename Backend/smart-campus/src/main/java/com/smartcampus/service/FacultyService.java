package com.smartcampus.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.FacultyRequest;
import com.smartcampus.dto.FacultyResponse;
import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.entity.Course;
import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.FacultyRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacultyService {	
	private final FacultyRepository facultyRepository;
	
	private final UserRepository userRepository;
	
	private Faculty findFaculty(Integer id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
    }
	
	 @Transactional
	    public FacultyResponse createFaculty(FacultyRequest request) {
	        if (facultyRepository.existsByUserIdUserId(request.getUserId())) {
	            throw new BadRequestException("Faculty Profile already exists for this User !");
	        }

	        User user = userRepository.findById(request.getUserId())
	                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
	        if (user.getRole() != Role.FACULTY) {
	            throw new BadRequestException("User must have FACULTY role");
	        }	        

	        Faculty faculty = ModelMapper.toFacultyEntity(request, user);
	        return ModelMapper.toFacultyResponse(facultyRepository.save(faculty));
	    }
	 
	 public List<FacultyResponse> getAllFaculties() {
	        return facultyRepository.findAll().stream().map(ModelMapper::toFacultyResponse).toList();
	    }
	 
	 
	 
	 public FacultyResponse getFacultyById(Integer id) {
	        return ModelMapper.toFacultyResponse(findFaculty(id));
	    }
	 
	 
	 @Transactional
	    public FacultyResponse updateFaculty(Integer id, FacultyRequest request) {
	        Faculty faculty = findFaculty(id);
	        
	        faculty.setDepartment(request.getDepartment());
	        return ModelMapper.toFacultyResponse(facultyRepository.save(faculty));
	    }
	 
	 @Transactional
	    public void deleteFaculty(Integer id) {
	        facultyRepository.delete(findFaculty(id));
	    }
	 
	 public FacultyResponse getFacultyByDepartment(String department) {
	        Faculty faculty = facultyRepository.findByDepartment(department)
	                .orElseThrow(() -> new ResourceNotFoundException("Student not found with roll no: " +department ));
	        return toResponse(faculty);
	    }
	 
	 private FacultyResponse toResponse(Faculty faculty) {
	        return FacultyResponse.builder()
	        		.facultyId(faculty.getFacultyId())
		            .userId(faculty.getUserId().getUserId())
		            .fullName(faculty.getUserId().getFullName())
		            .email(faculty.getUserId().getEmail())
		            .role(faculty.getUserId().getRole())
		            .department(faculty.getDepartment())
		            .build();
	    }
}
