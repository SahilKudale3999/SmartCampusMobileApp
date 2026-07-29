package com.smartcampus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartcampus.entity.Faculty;

public interface FacultyRepository extends JpaRepository<Faculty, Integer> {
	
	@Query("SELECT COUNT(f) > 0 FROM Faculty f WHERE f.userId.userId = :userId")
	boolean existsByUserIdUserId(@Param("userId") Integer userId);
	
	Optional<Faculty> findByDepartment(String department);
	
	@Query("SELECT f FROM Faculty f WHERE f.userId.userId = :userId")
	Optional<Faculty> findByUserId(@Param("userId") Integer userId);
	
	@Query("SELECT f FROM Faculty f WHERE f.userId.userId = :userId")
	Optional<Faculty> findByUserUserId(@Param("userId") Integer userId);
}