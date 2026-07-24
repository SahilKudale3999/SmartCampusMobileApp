package com.smartcampus.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {

	private Integer eventId;

    private String eventName;

    private String description;

    private String venue;

    private LocalDate eventDate;

    private Integer createdBy;

    private String createdByName;
}
