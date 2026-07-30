package com.smartcampus.repository;

import com.smartcampus.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
    List<Assignment> findBySubjectSubjectId(Integer subjectId);
    List<Assignment> findBySubjectSubjectIdIn(List<Integer> subjectIds);
}
