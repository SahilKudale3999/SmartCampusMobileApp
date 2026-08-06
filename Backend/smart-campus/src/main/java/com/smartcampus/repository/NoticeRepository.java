package com.smartcampus.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Integer>{

	long deleteByCreatedAtBefore(LocalDateTime dateTime);
	long countByCreatedByUserId(Integer userId);
	
}
