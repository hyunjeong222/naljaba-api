package com.spring.naljaba_api.dto.response;

import com.spring.naljaba_api.domain.date.AvailableDate;

import java.time.LocalDate;
import java.util.UUID;

public record AvailableDateResponse(
        UUID id,
        UUID memberId,
        LocalDate date
) {
    public static AvailableDateResponse from(AvailableDate availableDate) {
        return new AvailableDateResponse(
                availableDate.getId(),
                availableDate.getMember().getId(),
                availableDate.getDate()
        );
    }
}