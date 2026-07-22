package com.smartcampus.repository;

import com.smartcampus.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByStudentStudentId(Integer studentId);
    List<Attendance> findBySubjectSubjectId(Integer subjectId);
    List<Attendance> findByAttendanceDate(LocalDate date);
    List<Attendance> findByStudentStudentIdAndSubjectSubjectId(Integer studentId, Integer subjectId);
}
