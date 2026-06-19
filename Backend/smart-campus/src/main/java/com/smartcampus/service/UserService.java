package com.smartcampus.service;

import com.smartcampus.dto.UserRequest;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        User user = ModelMapper.toUserEntity(request);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        } else {
            throw new BadRequestException("Password is required");
        }
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(ModelMapper::toUserResponse).toList();
    }

    public UserResponse getUserById(Integer id) {
        return ModelMapper.toUserResponse(findUser(id));
    }

    @Transactional
    public UserResponse updateUser(Integer id, UserRequest request) {
        User user = findUser(id);
        user.setFullName(request.getFullName());
        user.setPhoneNo(request.getPhoneNo());
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Integer id) {
        userRepository.delete(findUser(id));
    }

    @Transactional
    public UserResponse activateUser(Integer id) {
        User user = findUser(id);
        user.setIsActive(true);
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse deactivateUser(Integer id) {
        User user = findUser(id);
        user.setIsActive(false);
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    private User findUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
