package com.smartcampus.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FacultyDashboardResponse {

	private String facultyName;
    private String department;
    private List<SubjectResponse> subjects;
    private int subjectCount;
    private int studentCount;
    private int assignmentCount;
    private int pendingReviews;
    private int attendancePending;
    private List<ActivityDTO> recentActivities;
    
}
