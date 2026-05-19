package com.spring.naljaba_api.dto.response;

public record ErrorResponse(
        int status,
        String message
) {}