package com.spring.naljaba_api.controller;

import com.spring.naljaba_api.domain.date.AvailableDateService;
import com.spring.naljaba_api.dto.request.ConfirmDateRequest;
import com.spring.naljaba_api.dto.request.SaveDatesRequest;
import com.spring.naljaba_api.dto.response.AvailableDateResponse;
import com.spring.naljaba_api.dto.response.ConfirmDateResponse;
import com.spring.naljaba_api.dto.response.DateResultResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dates")
@RequiredArgsConstructor
public class AvailableDateController {

    private final AvailableDateService availableDateService;

    // 날짜 선택 및 수정
    @PostMapping("/{memberId}")
    public ResponseEntity<List<AvailableDateResponse>> saveDates(
            @PathVariable UUID memberId,
            @Valid @RequestBody SaveDatesRequest request) {
        return ResponseEntity.ok(availableDateService.saveDates(memberId, request));
    }

    // 선택 날짜 조회
    @GetMapping("/{memberId}")
    public ResponseEntity<List<AvailableDateResponse>> getDates(
            @PathVariable UUID memberId) {
        return ResponseEntity.ok(availableDateService.getDates(memberId));
    }

    // 날짜별 집계 결과 조회
    @GetMapping("/results")
    public ResponseEntity<List<DateResultResponse>> getDateResults() {
        return ResponseEntity.ok(availableDateService.getDateResults());
    }

    // 날짜 확정 (방장만 가능)
    @PostMapping("/confirm/{memberId}")
    public ResponseEntity<ConfirmDateResponse> confirmDate(
            @PathVariable UUID memberId,
            @Valid @RequestBody ConfirmDateRequest request) {
        return ResponseEntity.ok(availableDateService.confirmDate(memberId, request));
    }

    // 확정 날짜 변경
    @PutMapping("/confirm/{memberId}")
    public ResponseEntity<ConfirmDateResponse> updateConfirmedDate(
            @PathVariable UUID memberId,
            @Valid @RequestBody ConfirmDateRequest request) {
        return ResponseEntity.ok(availableDateService.updateConfirmedDate(memberId, request));
    }

    // 확정 날짜 조회
    @GetMapping("/confirmed")
    public ResponseEntity<ConfirmDateResponse> getConfirmedDate() {
        return ResponseEntity.ok(availableDateService.getConfirmedDate());
    }
}