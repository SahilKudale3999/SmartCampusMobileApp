package com.smartcampus.service;

import com.smartcampus.dto.SubmissionRequest;
import com.smartcampus.dto.SubmissionResponse;
import com.smartcampus.entity.Assignment;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Submission;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.AssignmentRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public SubmissionResponse submitAssignment(SubmissionRequest request) {
        Assignment assignment = findAssignment(request.getAssignmentId());
        Student student = findStudent(request.getStudentId());

        Submission submission = ModelMapper.toSubmissionEntity(request, assignment, student);
        return ModelMapper.toSubmissionResponse(submissionRepository.save(submission));
    }

    public List<SubmissionResponse> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(ModelMapper::toSubmissionResponse)
                .toList();
    }

    public SubmissionResponse getSubmissionById(Integer id) {
        return ModelMapper.toSubmissionResponse(findSubmission(id));
    }

    @Transactional
    public SubmissionResponse updateSubmission(Integer id, SubmissionRequest request) {
        Submission submission = findSubmission(id);
        submission.setAssignment(findAssignment(request.getAssignmentId()));
        submission.setStudent(findStudent(request.getStudentId()));
        submission.setFileUrl(request.getFileUrl());
        submission.setGradeScore(request.getGradeScore());
        return ModelMapper.toSubmissionResponse(submissionRepository.save(submission));
    }

    @Transactional
    public void deleteSubmission(Integer id) {
        submissionRepository.delete(findSubmission(id));
    }

    public List<SubmissionResponse> getSubmissionsByAssignment(Integer assignmentId) {
        findAssignment(assignmentId);
        return submissionRepository.findByAssignmentAssignmentId(assignmentId).stream()
                .map(ModelMapper::toSubmissionResponse)
                .toList();
    }

    public List<SubmissionResponse> getSubmissionsByStudent(Integer studentId) {
        findStudent(studentId);
        return submissionRepository.findByStudentStudentId(studentId).stream()
                .map(ModelMapper::toSubmissionResponse)
                .toList();
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Integer id, BigDecimal gradeScore) {
        Submission submission = findSubmission(id);
        submission.setGradeScore(gradeScore);
        return ModelMapper.toSubmissionResponse(submissionRepository.save(submission));
    }

    private Assignment findAssignment(Integer assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
    }

    private Student findStudent(Integer studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private Submission findSubmission(Integer id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
    }
}
