package com.smartcampus.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcampus.dto.NoticeRequest;
import com.smartcampus.dto.NoticeResponse;
import com.smartcampus.entity.Notice;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.FacultyRepository;
import com.smartcampus.repository.NoticeRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.Role;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoticeService {
	
    private final NoticeRepository noticeRepository;
	
	private final UserRepository userRepository;
	
	
		private Notice findNotice(Integer id) {
	        return noticeRepository.findById(id)
	                .orElseThrow(() ->
	                        new ResourceNotFoundException(
	                                "Notice not found with id: " + id));
	    }
	
	   @Transactional
	    public NoticeResponse createNotice(NoticeRequest request) {

	        User user = userRepository.findById(request.getCreatedBy())
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("User not found"));

	        if (user.getRole() != Role.ADMIN &&
	                user.getRole() != Role.FACULTY) {
	            throw new BadRequestException("Only Admin or Faculty can create notices");
	        }

	        Notice notice = ModelMapper.toNoticeEntity(request, user);

	        return ModelMapper.toNoticeResponse(noticeRepository.save(notice));
	    }
	   
	   public List<NoticeResponse> getAllNotices() {
	        return noticeRepository.findAll()
	                .stream()
	                .map(ModelMapper::toNoticeResponse)
	                .toList();
	    }
	   
	   
	   public NoticeResponse getNoticeById(Integer id) {
	        return ModelMapper.toNoticeResponse(findNotice(id));
	    }
	   
	   @Transactional
	    public NoticeResponse updateNotice(Integer id, NoticeRequest request) {

	        Notice notice = findNotice(id);

	        User user = userRepository.findById(request.getCreatedBy())
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("User not found"));

	        if (user.getRole() != Role.ADMIN &&
	                user.getRole() != Role.FACULTY) {
	            throw new BadRequestException("Only Admin or Faculty can update notices");
	        }

	        notice.setTitle(request.getTitle());
	        notice.setDescription(request.getDescription());
	        notice.setCreatedBy(user);

	        return ModelMapper.toNoticeResponse(noticeRepository.save(notice));
	    }
	   
	   @Transactional
	    public void deleteNotice(Integer id) {

	        Notice notice = findNotice(id);

	        noticeRepository.delete(notice);
	    }
	   

}
