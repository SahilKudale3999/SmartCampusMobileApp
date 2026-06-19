package com.smartcampus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcampus.dto.UserRequestDTO;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;

import jdk.jshell.spi.ExecutionControl;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Get ALL USERS

    public List<User> getAllUser(){
        return userRepository.findAll();
    }

    public void deleteUser(Integer id){
        if(!userRepository.existsById(id) ){
            throw new RuntimeException("User not found with id : " + id );
        }
        userRepository.deleteById(id);
    }

     public UserRequestDTO createUser(UserRequestDTO dto) {

        User user = User.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phoneNo(dto.getPhoneNo())
                .password(dto.getPassword()) // later hash it
                .role("STUDENT") // controlled by backend
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        return UserRequestDTO.builder()
                .userId(savedUser.getUserId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phoneNo(savedUser.getPhoneNo())
                .role(savedUser.getRole())
                .isActive(savedUser.getIsActive())
                .build();
    }
}
