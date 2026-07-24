package com.smartcampus.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRequest {

	@NotBlank(message = "Event name is required")
    private String eventName;

    private String description;

    private String venue;

    @NotNull(message = "Event date is required")
    @FutureOrPresent(message = "Event date cannot be in the past")
    private LocalDate eventDate;

    @NotNull(message = "Created By is required")
    private Integer createdBy;
}
