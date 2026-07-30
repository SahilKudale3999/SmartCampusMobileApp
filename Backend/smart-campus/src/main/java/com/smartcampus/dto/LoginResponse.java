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
	private Integer studentId;
	private Integer facultyId;
	private Integer courseId;
	private String courseName; 
    private String rollNo;     
    private String department;
    private String fullName;
    private String email;
    private String phoneNo;
    private Role role;
}
