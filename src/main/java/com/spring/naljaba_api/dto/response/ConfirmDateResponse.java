package com.spring.naljaba_api.dto.response;

import java.time.LocalDate;

public record ConfirmDateResponse(
        LocalDate confirmedDate,
        String message
) {}