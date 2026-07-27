package com.smartcampus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.User;
import java.util.List;



public interface FacultyRepository extends JpaRepository<Faculty, Integer>{
	
	boolean existsByUserIdUserId(Integer userId);
	
	 Optional<Faculty> findByDepartment(String department);
	 
	 Optional<Faculty> findByUserId(Integer userId);
}

