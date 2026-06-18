package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserDto {
	
	@NotBlank(message = "Name is Required")
	private String fullName;
	
	@NotBlank(message = "email is Required")
	private String email;
	
	@NotBlank(message = "Enter Password")
	private String password;
	
	@NotBlank(message = "Enter Phone Number")
	private String phoneNo;
	
	@NotBlank(message = "Select The Role")
	private String role;
	
	@NotBlank(message = "Confirm Password is Required")
	private String confirmPassword;
	
}
