package com.smartcampus.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;

public interface UserRepository extends JpaRepository<User, Integer>{

	
}
