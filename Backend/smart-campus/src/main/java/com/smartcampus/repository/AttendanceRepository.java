package com.smartcampus.repository;

import com.smartcampus.dto.AttendanceResponse;
import com.smartcampus.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByStudentStudentId(Integer studentId);
    
    List<Attendance> findBySubjectSubjectId(Integer subjectId);
    
    List<Attendance> findByAttendanceDate(LocalDate date);
    
    List<Attendance> findByStudentStudentIdAndSubjectSubjectId(Integer studentId, Integer subjectId);
    
    @Query("SELECT DISTINCT a.subject.subjectId FROM Attendance a WHERE a.subject.subjectId IN :subjectIds AND a.attendanceDate = :date")
    List<Integer> findSubjectIdsMarkedOnDate(@Param("subjectIds") List<Integer> subjectIds, @Param("date") LocalDate date);
    
    void deleteBySubjectSubjectIdIn(List<Integer> subjectIds);
    
    void deleteByStudentStudentId(Integer studentId);
    
    
}
