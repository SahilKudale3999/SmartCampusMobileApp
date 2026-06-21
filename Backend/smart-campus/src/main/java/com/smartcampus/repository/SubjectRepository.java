package com.smartcampus.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.Subject;
import java.util.List;
import java.util.Optional;


public interface SubjectRepository extends JpaRepository<Subject,Integer>{

	
	boolean existsBySubjectName(String subjectName);
	
	List<Subject> findByCourseCourseId(Integer courseId);
	
	List<Subject> findByFacultyFacultyId(Integer facultyId);
}
