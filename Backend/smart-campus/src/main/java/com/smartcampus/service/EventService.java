package com.smartcampus.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.EventRequest;
import com.smartcampus.dto.EventResponse;
import com.smartcampus.entity.Event;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.ModelMapper;
import com.smartcampus.repository.EventRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {

	
	private final EventRepository eventRepository;
    private final UserRepository userRepository;
    
    private Event findEvent(Integer id) {

        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found with id: " + id));
    }
    
    @Transactional
    public EventResponse createEvent(EventRequest request) {

        User user = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN &&
                user.getRole() != Role.FACULTY) {
            throw new BadRequestException("Only Admin or Faculty can create events");
        }

        Event event = ModelMapper.toEventEntity(request, user);

        return ModelMapper.toEventResponse(eventRepository.save(event));
    }
    
    public List<EventResponse> getAllEvents() {

        return eventRepository.findAll()
                .stream()
                .map(ModelMapper::toEventResponse)
                .toList();
    }
    
    public List<EventResponse> getUpcomingEvents() {

        return eventRepository
                .findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now())
                .stream()
                .map(ModelMapper::toEventResponse)
                .toList();
    }
    
    public EventResponse getEventById(Integer id) {

        return ModelMapper.toEventResponse(findEvent(id));
    }
    
    @Transactional
    public EventResponse updateEvent(Integer id, EventRequest request) {

        Event event = findEvent(id);

        User user = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN &&
                user.getRole() != Role.FACULTY) {
            throw new BadRequestException("Only Admin or Faculty can update events");
        }

        event.setEventName(request.getEventName());
        event.setDescription(request.getDescription());
        event.setVenue(request.getVenue());
        event.setEventDate(request.getEventDate());
        event.setCreatedBy(user);

        return ModelMapper.toEventResponse(eventRepository.save(event));
    }
    
    @Transactional
    public void deleteEvent(Integer id) {

        Event event = findEvent(id);

        eventRepository.delete(event);
    }

    
    
    
}
