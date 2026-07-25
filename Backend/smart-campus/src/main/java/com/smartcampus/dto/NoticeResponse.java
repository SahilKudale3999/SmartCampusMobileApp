package com.smartcampus.dto;

import java.lang.invoke.StringConcatFactory;
import java.time.LocalDateTime;

import com.smartcampus.util.Role;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeResponse {

	 
	private Integer noticeId;
	
	private String title;

	private String description;

    private Integer createdBy;
    
    private String createdByName;

    private LocalDateTime createdAt;
}
