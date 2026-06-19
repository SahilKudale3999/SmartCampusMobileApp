package com.smartcampus.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.UserRequestDTO;
import com.smartcampus.entity.User;
import com.smartcampus.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor

public class UserController {

    private  final UserService userService;

    // GET ALL USERS API

    @GetMapping
    public List<User> getAllUser(){
        return userService.getAllUser();
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Integer id) {
    userService.deleteUser(id);
    return "User deleted successfully!";
    }

    


}
