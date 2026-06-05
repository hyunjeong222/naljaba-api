package com.spring.naljaba_api.controller;

import com.spring.naljaba_api.domain.date.AvailableDateService;
import com.spring.naljaba_api.dto.request.ConfirmDateRequest;
import com.spring.naljaba_api.dto.request.SaveDatesRequest;
import com.spring.naljaba_api.dto.response.AvailableDateResponse;
import com.spring.naljaba_api.dto.response.ConfirmDateResponse;
import com.spring.naljaba_api.dto.response.DateResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Date", description = "날짜 관련 API")
@RestController
@RequestMapping("/api/dates")
@RequiredArgsConstructor
public class AvailableDateController {

    private final AvailableDateService availableDateService;

    @Operation(summary = "확정 날짜 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "204", description = "아직 확정 안 됨 / 호스트 없음")
    })
    @GetMapping("/confirmed")
    public ResponseEntity<ConfirmDateResponse> getConfirmedDate() {
        ConfirmDateResponse response = availableDateService.getConfirmedDate();
        if (response == null) {
            return ResponseEntity.noContent().build(); // ← 204 반환
        }
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "날짜 선택 및 수정")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "저장 성공"),
            @ApiResponse(responseCode = "404", description = "멤버 없음")
    })
    @PostMapping("/{memberId}")
    public ResponseEntity<List<AvailableDateResponse>> saveDates(
            @PathVariable UUID memberId,
            @Valid @RequestBody SaveDatesRequest request) {
        return ResponseEntity.ok(availableDateService.saveDates(memberId, request));
    }

    @Operation(summary = "선택 날짜 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "멤버 없음")
    })
    @GetMapping("/{memberId}")
    public ResponseEntity<List<AvailableDateResponse>> getDates(
            @PathVariable UUID memberId) {
        return ResponseEntity.ok(availableDateService.getDates(memberId));
    }

    @Operation(summary = "날짜별 집계 결과 조회", description = "전원이 날짜를 선택한 경우에만 조회 가능")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "전원 미선택")
    })
    @GetMapping("/results")
    public ResponseEntity<List<DateResultResponse>> getDateResults() {
        return ResponseEntity.ok(availableDateService.getDateResults());
    }

    @Operation(summary = "날짜 확정 / 변경", description = "누구나 가능. 확정 전이면 확정, 확정 후면 변경으로 동작")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "확정 / 변경 성공"),
            @ApiResponse(responseCode = "400", description = "전원 미선택 / 같은 날짜 / 선택되지 않은 날짜")
    })
    @PostMapping("/confirm/{memberId}")
    public ResponseEntity<ConfirmDateResponse> confirmOrUpdateDate(
            @PathVariable UUID memberId,
            @Valid @RequestBody ConfirmDateRequest request) {
        return ResponseEntity.ok(availableDateService.confirmOrUpdateDate(memberId, request));
    }
}