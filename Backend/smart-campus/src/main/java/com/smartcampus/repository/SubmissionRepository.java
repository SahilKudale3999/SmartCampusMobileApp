package com.smartcampus.repository;

import com.smartcampus.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Integer> {
    List<Submission> findByAssignmentAssignmentId(Integer assignmentId);
    List<Submission> findByStudentStudentId(Integer studentId);
}
