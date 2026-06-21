package com.smartcampus.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.dto.SubjectRequest;
import com.smartcampus.dto.SubjectResponse;
import com.smartcampus.entity.Course;
import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Subject;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.FacultyRepository;
import com.smartcampus.repository.SubjectRepository;
import com.smartcampus.util.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubjectService {

	
	private final SubjectRepository subjectRepository;
	private final CourseRepository courseRepository;
	private final FacultyRepository facultyRepository;
	
	private Subject findSubject(Integer id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }
	
	@Transactional
    public SubjectResponse createSubject(SubjectRequest request) {
        
        if (subjectRepository.existsBySubjectName(request.getSubjectName())) {
            throw new BadRequestException("Subject Name already exists for this user");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        
        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        Subject subject = ModelMapper.toSubjectEntity(request,course,faculty);
        return ModelMapper.toSubjectResponse(subjectRepository.save(subject));
    }
	
	
	public List<SubjectResponse> getAllSubjects() {
        return subjectRepository.findAll().stream().map(ModelMapper::toSubjectResponse).toList();
    }
	
	public SubjectResponse getSubjectById(Integer id) {
        return ModelMapper.toSubjectResponse(findSubject(id));
    }
	
	 @Transactional
	    public SubjectResponse updateSubject(Integer id, SubjectRequest request) {
	        Subject subject = findSubject(id);
	        subject.setSubjectName(request.getSubjectName());
	        Course course = courseRepository.findById(request.getCourseId())
	                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
	        subject.setCourse(course);
	        Faculty faculty = facultyRepository.findById(request.getFacultyId())
	        		.orElseThrow(() -> new ResourceNotFoundException("Course not found"));
	        subject.setFaculty(faculty);
	        return ModelMapper.toSubjectResponse(subjectRepository.save(subject));
	    }
	 
	 @Transactional
	    public void deleteSubject(Integer id) {
	        subjectRepository.delete(findSubject(id));
	    }
	 
		
	 
	    public List<SubjectResponse> getSubjectsByCourse(Integer courseId) {
	
			   List<Subject> subjects = subjectRepository.findByCourseCourseId(courseId);
	
			   if (subjects.isEmpty()) {
			      throw new ResourceNotFoundException("No subjects found for this course");
			   }
	
			   return subjects.stream()
			            .map(ModelMapper::toSubjectResponse)
			            .toList();
	    }
	    
	    public List<SubjectResponse> getSubjectsByFaculty(Integer facultyId) {

	        List<Subject> subjects =
	                subjectRepository.findByFacultyFacultyId(facultyId);

	        if (subjects.isEmpty()) {
	            throw new ResourceNotFoundException(
	                "No subjects found for this faculty");
	        }

	        return subjects.stream()
	                .map(ModelMapper::toSubjectResponse)
	                .toList();
	    }
}
