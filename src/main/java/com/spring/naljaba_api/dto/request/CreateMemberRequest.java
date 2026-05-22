package com.spring.naljaba_api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateMemberRequest (
    @NotBlank(message = "이름을 입력해주세요")
    String name,
    String profileColor
) {}