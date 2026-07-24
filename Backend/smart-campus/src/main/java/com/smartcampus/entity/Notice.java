package com.smartcampus.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "notice")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Notice {

	
	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "notice_id")
	    private Integer noticeId;

	    @Column(name = "title", nullable = false)
	    private String title;

	    @Column(name = "description", nullable = false, unique = true)
	    private String description;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "created_by")
	    private User createdBy;

	    @Column(name = "created_at", insertable = false, updatable = false)
	    private LocalDateTime createdAt;

	    
}
