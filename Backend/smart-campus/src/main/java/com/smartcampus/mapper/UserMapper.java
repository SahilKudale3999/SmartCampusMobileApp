package com.smartcampus.mapper;

import com.smartcampus.dto.UserDto;
import com.smartcampus.entity.User;

public class UserMapper {
	
	public static User toUser(UserDto userDto) {
        if (userDto == null) {
            return null;
        }

        return User.builder()
                .fullName(userDto.getFullName())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .phoneNo(userDto.getPhoneNo())
                .role(userDto.getRole())
                .build();
    }
}
