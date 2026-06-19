package com.smartcampus.service;

import com.smartcampus.dto.CourseRequest;
import com.smartcampus.dto.CourseResponse;
import com.smartcampus.entity.Course;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.existsByCourseName(request.getCourseName())) {
            throw new BadRequestException("Course already exists");
        }
        Course course = ModelMapper.toCourseEntity(request);
        return ModelMapper.toCourseResponse(courseRepository.save(course));
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream().map(ModelMapper::toCourseResponse).toList();
    }

    public CourseResponse getCourseById(Integer id) {
        return ModelMapper.toCourseResponse(findCourse(id));
    }

    @Transactional
    public CourseResponse updateCourse(Integer id, CourseRequest request) {
        Course course = findCourse(id);
        course.setCourseName(request.getCourseName());
        return ModelMapper.toCourseResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Integer id) {
        courseRepository.delete(findCourse(id));
    }

    private Course findCourse(Integer id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }
}
