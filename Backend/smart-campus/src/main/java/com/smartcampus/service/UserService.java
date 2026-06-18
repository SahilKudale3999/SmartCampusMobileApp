package com.smartcampus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;
import com.smartcampus.mapper.UserMapper;
import com.smartcampus.repository.UserRepository;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepository;
	
	public User  addUser(User user) {
		
		if(userRepository.existsByEmail(user.getEmail())) {
			throw new RuntimeException("Email already exists");
		}
		return userRepository.save(user);
	}
	
	
	
	
	
	
	
}
