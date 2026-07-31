package com.smartcampus.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {

	
	private String title;
    private String description;
    private LocalDateTime timestamp;
    
}
