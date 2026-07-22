package com.smartcampus.service;

import com.smartcampus.dto.AssignmentRequest;
import com.smartcampus.dto.AssignmentResponse;
import com.smartcampus.entity.Assignment;
import com.smartcampus.entity.Subject;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.AssignmentRepository;
import com.smartcampus.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        Subject subject = findSubject(request.getSubjectId());
        Assignment assignment = ModelMapper.toAssignmentEntity(request, subject);
        return ModelMapper.toAssignmentResponse(assignmentRepository.save(assignment));
    }

    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(ModelMapper::toAssignmentResponse)
                .toList();
    }

    public AssignmentResponse getAssignmentById(Integer id) {
        return ModelMapper.toAssignmentResponse(findAssignment(id));
    }

    @Transactional
    public AssignmentResponse updateAssignment(Integer id, AssignmentRequest request) {
        Assignment assignment = findAssignment(id);
        Subject subject = findSubject(request.getSubjectId());

        assignment.setSubject(subject);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(request.getDeadline());

        return ModelMapper.toAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public void deleteAssignment(Integer id) {
        assignmentRepository.delete(findAssignment(id));
    }

    public List<AssignmentResponse> getAssignmentsBySubject(Integer subjectId) {
        findSubject(subjectId);
        return assignmentRepository.findBySubjectSubjectId(subjectId).stream()
                .map(ModelMapper::toAssignmentResponse)
                .toList();
    }

    private Subject findSubject(Integer subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
    }

    private Assignment findAssignment(Integer id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
    }
}
