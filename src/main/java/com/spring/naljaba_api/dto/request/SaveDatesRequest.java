package com.spring.naljaba_api.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;
import java.util.List;

public record SaveDatesRequest(
        @NotEmpty(message = "날짜를 하나 이상 선택해주세요")
        List<LocalDate> dates
) {}