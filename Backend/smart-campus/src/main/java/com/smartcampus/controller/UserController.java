package com.smartcampus.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
