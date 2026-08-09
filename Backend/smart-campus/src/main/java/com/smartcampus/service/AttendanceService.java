package com.smartcampus.service;

import com.smartcampus.dto.AttendancePercentageResponse;
import com.smartcampus.dto.AttendanceRequest;
import com.smartcampus.dto.AttendanceResponse;
import com.smartcampus.entity.Attendance;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Subject;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.AttendanceRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.SubjectRepository;
import com.smartcampus.util.AttendanceStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public AttendanceResponse createAttendance(AttendanceRequest request) {
        Student student = findStudent(request.getStudentId());
        Subject subject = findSubject(request.getSubjectId());

        Attendance attendance = Attendance.builder()
                .student(student)
                .subject(subject)
                .status(request.getStatus())
                .attendanceDate(request.getAttendanceDate())
                .build();

        return toResponse(attendanceRepository.save(attendance));
    }

    @Transactional
    public AttendanceResponse updateAttendance(Integer id, AttendanceRequest request) {
        Attendance attendance = findAttendance(id);
        attendance.setStudent(findStudent(request.getStudentId()));
        attendance.setSubject(findSubject(request.getSubjectId()));
        attendance.setStatus(request.getStatus());
        attendance.setAttendanceDate(request.getAttendanceDate());
        return toResponse(attendanceRepository.save(attendance));
    }

    @Transactional
    public void deleteAttendance(Integer id) {
        attendanceRepository.delete(findAttendance(id));
    }

    public AttendanceResponse getAttendanceById(Integer id) {
        return toResponse(findAttendance(id));
    }

    public List<AttendanceResponse> getAttendanceByStudent(Integer studentId) {
        findStudent(studentId);
        return attendanceRepository.findByStudentStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public List<AttendanceResponse> getAttendanceBySubject(Integer subjectId) {
        findSubject(subjectId);
        return attendanceRepository.findBySubjectSubjectId(subjectId).stream().map(this::toResponse).toList();
    }

    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date).stream().map(this::toResponse).toList();
    }

    public AttendancePercentageResponse getAttendancePercentage(Integer studentId, Integer subjectId) {
        findStudent(studentId);
        findSubject(subjectId);

        List<Attendance> records = attendanceRepository.findByStudentStudentIdAndSubjectSubjectId(studentId, subjectId);
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long totalCount = records.size();

        double percentage = totalCount == 0 ? 0.0 : Math.round((presentCount * 100.0 / totalCount) * 100.0) / 100.0;

        return AttendancePercentageResponse.builder()
                .studentId(studentId)
                .subjectId(subjectId)
                .presentCount(presentCount)
                .totalCount(totalCount)
                .percentage(percentage)
                .build();
    }

    private Student findStudent(Integer studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    private Subject findSubject(Integer subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
    }

    private Attendance findAttendance(Integer id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .attendanceId(attendance.getAttendanceId())
                .studentId(attendance.getStudent().getStudentId())
                .studentName(attendance.getStudent().getUser().getFullName())
                .subjectId(attendance.getSubject().getSubjectId())
                .subjectName(attendance.getSubject().getSubjectName())
                .status(attendance.getStatus())
                .attendanceDate(attendance.getAttendanceDate())
                .build();
    }
    
    
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
