package com.smartcampus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "faculty")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Faculty {
	
	 @Id
	 @GeneratedValue(strategy = GenerationType.IDENTITY)
	 @Column(name = "faculty_id")
	private Integer facultyId;
	
	 @OneToOne(fetch = FetchType.LAZY)
	 @JoinColumn(name = "user_id", nullable = false, unique = true) 
	private User userId;
	
	 @Column(name = "department")
	private String department;
}
