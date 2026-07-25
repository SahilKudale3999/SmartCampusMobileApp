package com.smartcampus.repository;

import com.smartcampus.entity.User;
import com.smartcampus.util.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
}
