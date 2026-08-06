package com.smartcampus.service;

import com.smartcampus.entity.Faculty;
import com.smartcampus.entity.Student;
import com.smartcampus.entity.Subject;
import com.smartcampus.entity.User;
import com.smartcampus.repository.FacultyRepository;
import com.smartcampus.repository.StudentRepository;
import com.smartcampus.repository.SubjectRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final RestTemplate restTemplate = new RestTemplate();

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;

    @Value("${ollama.api.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    public String getResponse(String userMessage, Integer userId) {

        String userContext = buildUserContext(userId);
        String subjectContext = buildSubjectContext(userMessage);

        String systemPrompt = """
                You are SmartCampus Assistant, a helpful and knowledgeable campus information bot.

                Rules:
                - Use the User Context and Subject Context below ONLY if they are relevant to the question.
                - If the Subject Context says "No matching subject found," do NOT make up any subject, faculty, department, or link. Instead, say you don't have that information in the system.
                - Never invent URLs, websites, or contact details.
                - Give thorough, detailed answers. Explain your reasoning, add relevant context, and elaborate with examples or extra helpful detail where appropriate, instead of short one-line replies.

                User Context:
                %s

                Subject Context:
                %s
                """.formatted(userContext, subjectContext);

        String fullPrompt = systemPrompt + "\n\nQuestion: " + userMessage;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", ollamaModel);
        requestBody.put("prompt", fullPrompt);
        requestBody.put("stream", false);

        Map<String, Object> options = new HashMap<>();
        options.put("num_predict", 512); // increase max output length
        requestBody.put("options", options);

        ResponseEntity<Map> response = restTemplate.postForEntity(ollamaUrl, requestBody, Map.class);

        if (response.getBody() == null || response.getBody().get("response") == null) {
            return "Sorry, I couldn't generate a response right now.";
        }

        return response.getBody().get("response").toString();
    }

    private String buildUserContext(Integer userId) {
        if (userId == null) {
            return "No logged-in user info available.";
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return "No logged-in user info available.";
        }

        User user = userOpt.get();
        StringBuilder context = new StringBuilder();
        context.append("Name: ").append(user.getFullName()).append("\n");
        context.append("Email: ").append(user.getEmail()).append("\n");
        context.append("Role: ").append(user.getRole()).append("\n");

        if (user.getRole() == Role.FACULTY) {
            facultyRepository.findByUserId(userId).ifPresent(faculty ->
                    context.append("Department: ").append(faculty.getDepartment()).append("\n"));
        } else if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUserUserId(userId).ifPresent(student -> {
                context.append("Roll No: ").append(student.getRollNo()).append("\n");
                if (student.getCourse() != null) {
                    context.append("Course: ").append(student.getCourse().getCourseName()).append("\n");
                }
            });
        }

        return context.toString();
    }

    private String buildSubjectContext(String userMessage) {
        List<Subject> allSubjects = subjectRepository.findAll();
        StringBuilder context = new StringBuilder();

        String lowerMessage = userMessage.toLowerCase();

        for (Subject subject : allSubjects) {
            if (subject.getSubjectName() != null
                    && lowerMessage.contains(subject.getSubjectName().toLowerCase())) {

                context.append("Subject: ").append(subject.getSubjectName()).append("\n");

                if (subject.getFaculty() != null) {
                    Faculty faculty = subject.getFaculty();
                    context.append("Department: ").append(faculty.getDepartment()).append("\n");

                    if (faculty.getUserId() != null) {
                        context.append("Taught by: ")
                                .append(faculty.getUserId().getFullName()).append("\n");
                    }
                }

                if (subject.getCourse() != null) {
                    context.append("Course: ").append(subject.getCourse().getCourseName()).append("\n");
                }

                context.append("\n");
            }
        }

        return context.length() == 0 ? "No matching subject found." : context.toString();
    }
}