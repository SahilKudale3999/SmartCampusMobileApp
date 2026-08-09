package com.smartcampus.service;

import com.smartcampus.dto.ChangePasswordRequest;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.LoginResponse;
import com.smartcampus.dto.UserRequest;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Subject;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.AssignmentRepository;
import com.smartcampus.repository.AttendanceRepository;
import com.smartcampus.repository.EventRepository;
import com.smartcampus.repository.FacultyRepository;
import com.smartcampus.repository.NoticeRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.SubjectRepository;
import com.smartcampus.repository.SubmissionRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.Role;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final AttendanceRepository attendanceRepository;
    private final NoticeRepository noticeRepository;
    private final EventRepository eventRepository;

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        User user = ModelMapper.toUserEntity(request);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        } else {
            throw new BadRequestException("Password is required");
        }
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(ModelMapper::toUserResponse).toList();
    }

    public UserResponse getUserById(Integer id) {
        return ModelMapper.toUserResponse(findUser(id));
    }

    @Transactional
    public UserResponse updateUser(Integer id, UserRequest request) {
        User user = findUser(id);
        user.setFullName(request.getFullName());
        user.setPhoneNo(request.getPhoneNo());
        user.setRole(request.getRole());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Integer id) {
        User user = findUser(id);

        if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUserUserId(id).ifPresent(student -> {
                Integer studentId = student.getStudentId();
                submissionRepository.deleteByStudentStudentId(studentId);
                attendanceRepository.deleteByStudentStudentId(studentId);
                studentRepository.delete(student);
            });
        } else if (user.getRole() == Role.FACULTY) {
            facultyRepository.findByUserId(id).ifPresent(faculty -> {
                Integer facultyId = faculty.getFacultyId();
                List<Subject> subjects = subjectRepository.findByFacultyFacultyId(facultyId);
                List<Integer> subjectIds = subjects.stream().map(Subject::getSubjectId).toList();

                if (!subjectIds.isEmpty()) {
                    List<Integer> assignmentIds = assignmentRepository
                            .findBySubjectSubjectIdIn(subjectIds)
                            .stream()
                            .map(a -> a.getAssignmentId())
                            .toList();

                    if (!assignmentIds.isEmpty()) {
                        submissionRepository.deleteByAssignmentAssignmentIdIn(assignmentIds);
                    }
                    assignmentRepository.deleteBySubjectSubjectIdIn(subjectIds);
                    attendanceRepository.deleteBySubjectSubjectIdIn(subjectIds);
                    subjectRepository.deleteAll(subjects);
                }
                facultyRepository.delete(faculty);
            });
        } else if (user.getRole() == Role.ADMIN) {
            noticeRepository.deleteByCreatedBy(id);
            eventRepository.deleteByCreatedBy(id);
        }

        userRepository.delete(user);
    }

    @Transactional
    public UserResponse activateUser(Integer id) {
        User user = findUser(id);
        user.setIsActive(true);
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse deactivateUser(Integer id) {
        User user = findUser(id);
        user.setIsActive(false);
        return ModelMapper.toUserResponse(userRepository.save(user));
    }

    private User findUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("User account is inactive");
        }

        Integer studentId = null;
        Integer facultyId = null;
        Integer courseId = null;
        String courseName = null;
        String rollNo = null;

        if (user.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUserUserId(user.getUserId());
            studentId = studentOpt.map(Student::getStudentId).orElse(null);
            courseId = studentOpt.map(s -> s.getCourse().getCourseId()).orElse(null);

            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                rollNo = student.getRollNo();
                if (student.getCourse() != null) {
                    courseName = student.getCourse().getCourseName();
                }
            }
        } else if (user.getRole() == Role.FACULTY) {
            facultyId = facultyRepository.findByUserId(user.getUserId())
                    .map(Faculty::getFacultyId)
                    .orElse(null);
        }

        return LoginResponse.builder()
                .userId(user.getUserId())
                .studentId(studentId)
                .facultyId(facultyId)
                .courseId(courseId)
                .courseName(courseName)
                .rollNo(rollNo)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNo(user.getPhoneNo())
                .role(user.getRole())
                .build();
    }
    
    public void changePassword(Integer id, ChangePasswordRequest request) {
        User user = findUser(id); // reuses your existing helper + ResourceNotFoundException

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
