package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectResponse {

	private Integer subjectId;
    private String subjectName;
    private Integer courseId;
    private String courseName;
    private Integer facultyId;
    
}
