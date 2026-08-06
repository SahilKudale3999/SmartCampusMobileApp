package com.smartcampus.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.ActivityDTO;
import com.smartcampus.dto.FacultyDashboardResponse;
import com.smartcampus.dto.FacultyRequest;
import com.smartcampus.dto.FacultyResponse;
import com.smartcampus.dto.StudentRequest;
import com.smartcampus.dto.StudentResponse;
import com.smartcampus.dto.SubjectResponse;
import com.smartcampus.entity.Course;
import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Subject;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.AssignmentRepository;
import com.smartcampus.repository.AttendanceRepository;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.FacultyRepository;
import com.smartcampus.repository.NoticeRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.SubjectRepository;
import com.smartcampus.repository.SubmissionRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacultyService {	
	private final FacultyRepository facultyRepository;
	
	private final UserRepository userRepository;
	
	private final SubjectRepository subjectRepository;
	private final StudentRepository studentRepository;
	private final AssignmentRepository assignmentRepository;
	private final SubmissionRepository submissionRepository;
	private final AttendanceRepository attendanceRepository;
	private final NoticeRepository noticeRepository;
	
	private Faculty findFaculty(Integer id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
    }
	
	 @Transactional
	    public FacultyResponse createFaculty(FacultyRequest request) {
	        if (facultyRepository.existsByUserIdUserId(request.getUserId())) {
	            throw new BadRequestException("Faculty Profile already exists for this User !");
	        }

	        User user = userRepository.findById(request.getUserId())
	                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
	        if (user.getRole() != Role.FACULTY) {
	            throw new BadRequestException("User must have FACULTY role");
	        }	        

	        Faculty faculty = ModelMapper.toFacultyEntity(request, user);
	        return ModelMapper.toFacultyResponse(facultyRepository.save(faculty));
	    }
	 
	 public List<FacultyResponse> getAllFaculties() {
	        return facultyRepository.findAll().stream().map(ModelMapper::toFacultyResponse).toList();
	    }
	 
	 
	 
	 public FacultyResponse getFacultyById(Integer id) {
	        return ModelMapper.toFacultyResponse(findFaculty(id));
	    }
	 
	 
	 @Transactional
	    public FacultyResponse updateFaculty(Integer id, FacultyRequest request) {
	        Faculty faculty = findFaculty(id);
	        
	        faculty.setDepartment(request.getDepartment());
	        return ModelMapper.toFacultyResponse(facultyRepository.save(faculty));
	    }
	 
	 @Transactional
	    public void deleteFaculty(Integer id) {
	        facultyRepository.delete(findFaculty(id));
	    }
	 
	 public FacultyResponse getFacultyByDepartment(String department) {
	        Faculty faculty = facultyRepository.findByDepartment(department)
	                .orElseThrow(() -> new ResourceNotFoundException("Student not found with roll no: " +department ));
	        return toResponse(faculty);
	    }
	 
	 private FacultyResponse toResponse(Faculty faculty) {
	        return FacultyResponse.builder()
	        		.facultyId(faculty.getFacultyId())
		            .userId(faculty.getUserId().getUserId())
		            .fullName(faculty.getUserId().getFullName())
		            .email(faculty.getUserId().getEmail())
		            .role(faculty.getUserId().getRole())
		            .department(faculty.getDepartment())
		            .build();
	    }
	 
	 
	 public FacultyDashboardResponse getFacultyDashboard(Integer facultyId) {

	     Faculty faculty = findFaculty(facultyId);

	     List<Subject> subjectEntities =
	             subjectRepository.findByFacultyFacultyId(facultyId);

	     List<SubjectResponse> subjects =
	             subjectEntities.stream()
	                     .map(s -> SubjectResponse.builder()
	                             .subjectId(s.getSubjectId())
	                             .subjectName(s.getSubjectName())
	                             .courseId(s.getCourse().getCourseId())
	                             .courseName(s.getCourse().getCourseName())
	                             .facultyId(faculty.getFacultyId())
	                             .facultyName(faculty.getUserId().getFullName())
	                             .build())
	                     .toList();

	     List<Integer> subjectIds =
	             subjectEntities.stream()
	                     .map(Subject::getSubjectId)
	                     .toList();

	     List<Integer> courseIds =
	             subjectEntities.stream()
	                     .map(s -> s.getCourse().getCourseId())
	                     .distinct()
	                     .toList();

	     long studentCount =
	             courseIds.isEmpty()
	                     ? 0
	                     : studentRepository.countByCourseCourseIdIn(courseIds);

	     int assignmentCount =
	             subjectIds.isEmpty()
	                     ? 0
	                     : assignmentRepository.findBySubjectSubjectIdIn(subjectIds).size();

	     long pendingReviews =
	             subjectIds.isEmpty()
	                     ? 0
	                     : submissionRepository.countPendingBySubjectIds(subjectIds);

	     int attendancePending = 0;

	     if (!subjectIds.isEmpty()) {

	         List<Integer> markedToday =
	                 attendanceRepository.findSubjectIdsMarkedOnDate(
	                         subjectIds,
	                         LocalDate.now());

	         attendancePending =
	                 subjectIds.size() - markedToday.size();
	     }

	     List<ActivityDTO> recentActivities =
	             buildRecentActivities(subjectIds);

	     int noticeCount =
	    	        (int) noticeRepository.countByCreatedByUserId(
	    	                faculty.getUserId().getUserId()
	    	        );

	     return FacultyDashboardResponse.builder()
	             .facultyName(faculty.getUserId().getFullName())
	             .department(faculty.getDepartment())
	             .subjects(subjects)
	             .subjectCount(subjects.size())
	             .studentCount((int) studentCount)
	             .noticeCount(noticeCount)
	             .assignmentCount(assignmentCount)
	             .pendingReviews((int) pendingReviews)
	             .attendancePending(attendancePending)
	             .recentActivities(recentActivities)
	             .build();
	 }

	 private List<ActivityDTO> buildRecentActivities(List<Integer> subjectIds) {
		    if (subjectIds.isEmpty()) {
		        return List.of();
		    }

		    List<ActivityDTO> activities = new ArrayList<>();

		    assignmentRepository.findBySubjectSubjectIdIn(subjectIds).forEach(a ->
		            activities.add(new ActivityDTO(
		                    "New assignment created",
		                    a.getSubject().getSubjectName() + " - " + a.getTitle(),
		                    a.getCreatedAt()
		            ))
		    );

		    submissionRepository.findByAssignmentSubjectSubjectIdIn(subjectIds).forEach(s ->
		            activities.add(new ActivityDTO(
		                    "Submission received",
		                    s.getStudent().getUser().getFullName() + " submitted " + s.getAssignment().getTitle(),
		                    s.getSubmittedAt()
		            ))
		    );

		    return activities.stream()
		            .sorted(Comparator.comparing(ActivityDTO::getTimestamp).reversed())
		            .limit(5)
		            .toList();
		}
}