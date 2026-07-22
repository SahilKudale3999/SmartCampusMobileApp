package com.smartcampus.mapper;

import com.smartcampus.dto.AssignmentRequest;
import com.smartcampus.dto.AssignmentResponse;
import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.CourseResponse;
import com.smartcampus.dto.FacultyRequest;
import com.smartcampus.dto.FacultyResponse;
import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.dto.SubjectRequest;
import com.smartcampus.dto.SubjectResponse;
import com.smartcampus.dto.SubmissionRequest;
import com.smartcampus.dto.SubmissionResponse;
import com.smartcampus.dto.UserRequest;
import com.smartcampus.dto.UserResponse;
import com.smartcampus.entity.Assignment;
import com.smartcampus.entity.Course;
import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Subject;
import com.smartcampus.entity.Submission;
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


		public static FacultyResponse toFacultyResponse(Faculty faculty) {
		    if (faculty == null) {
		        return null;
		    }
		    return FacultyResponse.builder()
		            .facultyId(faculty.getFacultyId())
		            .userId(faculty.getUserId().getUserId())
		            .fullName(faculty.getUserId().getFullName())
		            .email(faculty.getUserId().getEmail())
		            .role(faculty.getUserId().getRole())
		            .department(faculty.getDepartment())
		            .build();
		}
		
		
		
		
		public static Faculty toFacultyEntity(FacultyRequest request, User user) {
		    if (request == null || user == null ) {
		        return null;
		    }
		    return Faculty.builder()
		            .userId(user)
		            .department(request.getDepartment())
		            .build();
		}
		
		
		public static SubjectResponse toSubjectResponse(Subject subject) {
			
		    if (subject == null) {
		        return null;
		    }
		    return SubjectResponse.builder()
		    		
		            .subjectId(subject.getSubjectId())
		            .subjectName(subject.getSubjectName())
		            .courseId(subject.getCourse().getCourseId())
		            .courseName(subject.getCourse().getCourseName())
		            .facultyId(subject.getFaculty().getFacultyId())
		            .build();
		}
		
		public static Subject toSubjectEntity(SubjectRequest request,Course course ,  Faculty faculty) {
		    if (request == null || course == null || faculty == null ) {
		        return null;
		    }
		    return Subject.builder()
		            .subjectName(request.getSubjectName())
		            .course(course)
		            .faculty(faculty)
		            .build();
		}

		public static AssignmentResponse toAssignmentResponse(Assignment assignment) {
		    if (assignment == null) {
		        return null;
		    }
		    return AssignmentResponse.builder()
		            .assignmentId(assignment.getAssignmentId())
		            .subjectId(assignment.getSubject().getSubjectId())
		            .subjectName(assignment.getSubject().getSubjectName())
		            .title(assignment.getTitle())
		            .description(assignment.getDescription())
		            .deadline(assignment.getDeadline())
		            .createdAt(assignment.getCreatedAt())
		            .build();
		}

		public static Assignment toAssignmentEntity(AssignmentRequest request, Subject subject) {
		    if (request == null || subject == null) {
		        return null;
		    }
		    return Assignment.builder()
		            .subject(subject)
		            .title(request.getTitle())
		            .description(request.getDescription())
		            .deadline(request.getDeadline())
		            .build();
		}

		public static SubmissionResponse toSubmissionResponse(Submission submission) {
		    if (submission == null) {
		        return null;
		    }
		    return SubmissionResponse.builder()
		            .submissionId(submission.getSubmissionId())
		            .assignmentId(submission.getAssignment().getAssignmentId())
		            .assignmentTitle(submission.getAssignment().getTitle())
		            .studentId(submission.getStudent().getStudentId())
		            .studentName(submission.getStudent().getUser().getFullName())
		            .fileUrl(submission.getFileUrl())
		            .submittedAt(submission.getSubmittedAt())
		            .gradeScore(submission.getGradeScore())
		            .build();
		}

		public static Submission toSubmissionEntity(SubmissionRequest request, Assignment assignment, Student student) {
		    if (request == null || assignment == null || student == null) {
		        return null;
		    }
		    return Submission.builder()
		            .assignment(assignment)
		            .student(student)
		            .fileUrl(request.getFileUrl())
		            .gradeScore(request.getGradeScore())
		            .build();
		}
}
