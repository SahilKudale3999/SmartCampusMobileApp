package com.smartcampus.repository;

import com.smartcampus.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Integer> {
    List<Submission> findByAssignmentAssignmentId(Integer assignmentId);
    
    List<Submission> findByStudentStudentId(Integer studentId);
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignment.subject.subjectId IN :subjectIds AND s.gradeScore IS NULL")
    long countPendingBySubjectIds(@Param("subjectIds") List<Integer> subjectIds);
    
    List<Submission> findByAssignmentSubjectSubjectIdIn(List<Integer> subjectIds);
    
    void deleteByAssignmentAssignmentIdIn(List<Integer> assignmentIds);
    
    void deleteByStudentStudentId(Integer studentId);
}
