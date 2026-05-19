package com.spring.naljaba_api.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ConfirmDateRequest(
        @NotNull(message = "날짜를 선택해주세요")
        LocalDate date
) {}