package com.smartcampus.service;

import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.entity.Course;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.User;
import com.smartcampus.util.Role;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        if (studentRepository.existsByRollNo(request.getRollNo())) {
            throw new BadRequestException("Roll number already exists");
        }
        if (studentRepository.existsByUserUserId(request.getUserId())) {
            throw new BadRequestException("Student profile already exists for this user");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new BadRequestException("User must have STUDENT role");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Student student = ModelMapper.toStudentEntity(request, user, course);
        return ModelMapper.toStudentResponse(studentRepository.save(student));
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream().map(ModelMapper::toStudentResponse).toList();
    }

    public StudentResponse getStudentById(Integer id) {
        return ModelMapper.toStudentResponse(findStudent(id));
    }

    @Transactional
    public StudentResponse updateStudent(Integer id, StudentRequest request) {
        Student student = findStudent(id);
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        student.setCourse(course);
        student.setRollNo(request.getRollNo());
        return ModelMapper.toStudentResponse(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Integer id) {
        studentRepository.delete(findStudent(id));
    }

    public List<StudentResponse> getStudentsByCourse(Integer courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return studentRepository.findByCourse(course).stream().map(this::toResponse).toList();
    }

    public StudentResponse getStudentByRollNo(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with roll no: " + rollNo));
        return toResponse(student);
    }

    private Student findStudent(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private StudentResponse toResponse(Student student) {
        return StudentResponse.builder()
                .studentId(student.getStudentId())
                .userId(student.getUser().getUserId())
                .fullName(student.getUser().getFullName())
                .email(student.getUser().getEmail())
                .courseId(student.getCourse().getCourseId())
                .courseName(student.getCourse().getCourseName())
                .rollNo(student.getRollNo())
                .build();
    }
}
