package com.smartcampus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;
import com.smartcampus.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")	
public class UserController {
	
	@Autowired
	private UserService userService;
	
	@PostMapping
	public User addUser(@RequestBody User user) {
        return userService.addUser(user);
    }
	
	
	
}
