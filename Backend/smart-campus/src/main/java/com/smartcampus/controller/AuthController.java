package com.smartcampus.controller;

import com.smartcampus.dto.AuthRequest;
import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.UserRequest;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.entity.User;
import com.smartcampus.service.JwtService;
import com.smartcampus.service.UserService;
import com.smartcampus.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        UserResponse userResponse = null;
        if (userDetails instanceof User user) {
            userResponse = UserResponse.builder()
                    .userId(user.getUserId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phoneNo(user.getPhoneNo())
                    .role(user.getRole())
                    .isActive(user.getIsActive())
                    .build();
        }

        AuthResponse authResponse = new AuthResponse(token, userResponse);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody UserRequest request) {
        UserResponse createdUser = userService.createUser(request);
        UserDetails userDetails = userDetailsService.loadUserByUsername(createdUser.getEmail());
        String token = jwtService.generateToken(userDetails);

        AuthResponse authResponse = new AuthResponse(token, createdUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Registration successful", authResponse));
    }
}
