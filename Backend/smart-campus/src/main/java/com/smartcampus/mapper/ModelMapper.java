package com.smartcampus.mapper;

import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.CourseResponse;
import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.dto.UserRequest;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.entity.Course;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.User;

public class ModelMapper {

    //course entityrequest mapper
    public static Course toCourseEntity(CourseRequest request) {
        if (request == null) {
            return null;
        }
        return Course.builder()
                .courseName(request.getCourseName())
                .build();
    }


    //course response mapper
    public static CourseResponse toCourseResponse(Course course) {
        if (course == null) {
            return null;
        }
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .courseName(course.getCourseName())
                .build();
    }


    //user entityrequest mapper
    public static User toUserEntity(UserRequest request) {
        if (request == null) {
            return null;
        }
        return User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNo(request.getPhoneNo())
                .role(request.getRole())
                .isActive(true)
                .build();
    }

    public static UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNo(user.getPhoneNo())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }

    public static StudentResponse toStudentResponse(Student student) {
        if (student == null) {
            return null;
        }
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




    public static Student toStudentEntity(StudentRequest request, User user, Course course) {
        if (request == null || user == null || course == null) {
            return null;
        }
        return Student.builder()
                .user(user)
                .course(course)
                .rollNo(request.getRollNo())
                .build();
    }
}
