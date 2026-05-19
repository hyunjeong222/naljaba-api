package com.spring.naljaba_api.dto.response;

import java.time.LocalDate;
import java.util.List;

public record DateResultResponse(
        LocalDate date,
        Long count,
        List<String> memberNames // 해당 날짜 선택한 멤버 이름 목록
) {}