package com.smartcampus.repository;

import com.smartcampus.entity.Course;
import com.smartcampus.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByCourse(Course course);
    Optional<Student> findByRollNo(String rollNo);
    boolean existsByRollNo(String rollNo);
    boolean existsByUserUserId(Integer userId);
    Optional<Student> findByUserUserId(Integer userId);
    
    long countByCourseCourseIdIn(List<Integer> courseIds);
    
}
