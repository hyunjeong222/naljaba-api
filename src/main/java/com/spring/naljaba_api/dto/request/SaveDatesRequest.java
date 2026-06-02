package com.spring.naljaba_api.dto.request;

import java.time.LocalDate;
import java.util.List;

public record SaveDatesRequest(
        List<LocalDate> dates
) {}