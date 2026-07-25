package com.smartcampus.dto;

import com.smartcampus.util.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

	
	private Integer userId;
    private String fullName;
    private String email;
    private String phoneNo;
    private Role role;
}
