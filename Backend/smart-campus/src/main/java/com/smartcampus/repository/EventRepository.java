package com.smartcampus.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.Event;

public interface EventRepository extends JpaRepository<Event, Integer> {

	
	List<Event> findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate eventDate);
	
	
}
