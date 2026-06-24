package com.spring.naljaba_api.domain.date;

import com.spring.naljaba_api.domain.member.Member;
import com.spring.naljaba_api.dto.request.ConfirmDateRequest;
import com.spring.naljaba_api.dto.request.SaveDatesRequest;
import com.spring.naljaba_api.dto.response.AvailableDateResponse;
import com.spring.naljaba_api.dto.response.ConfirmDateResponse;
import com.spring.naljaba_api.dto.response.DateResultResponse;
import com.spring.naljaba_api.exception.CustomException;
import com.spring.naljaba_api.exception.ErrorCode;
import com.spring.naljaba_api.repository.AvailableDateRepository;
import com.spring.naljaba_api.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AvailableDateService {

    private final AvailableDateRepository availableDateRepository;
    private final MemberRepository memberRepository;

    // 날짜 선택 및 수정
    @Transactional
    public List<AvailableDateResponse> saveDates(UUID memberId, SaveDatesRequest request) {
        // 멤버 존재 확인
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 빈 배열이 아닐 때만 유효성 검사
        if (request.dates() != null && !request.dates().isEmpty()) {
            validateDates(request.dates());
        }

        // 기존 날짜 삭제 후 flush로 즉시 DB 반영
        availableDateRepository.deleteByMemberId(member.getId());
        availableDateRepository.flush();

        // 빈 배열이면 삭제만 하고 반환
        if (request.dates() == null || request.dates().isEmpty()) {
            return List.of();
        }

        // 새 날짜 저장
        List<AvailableDate> dates = request.dates().stream()
                .map(date -> AvailableDate.create(member, date))
                .toList();

        availableDateRepository.saveAll(dates);

        return dates.stream()
                .map(AvailableDateResponse::from)
                .toList();
    }

    // 선택 날짜 조회
    @Transactional(readOnly = true)
    public List<AvailableDateResponse> getDates(UUID memberId) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        return availableDateRepository.findByMemberId(memberId)
                .stream()
                .map(AvailableDateResponse::from)
                .toList();
    }

    // 날짜별 집계 결과 조회
    @Transactional(readOnly = true)
    public List<DateResultResponse> getDateResults() {

        long totalMemberCount = memberRepository.count();

        if (totalMemberCount == 0) {
            throw new CustomException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 전원이 날짜를 선택했는지 확인
        long selectedMemberCount = availableDateRepository.countDistinctMember();
        if (totalMemberCount != selectedMemberCount) {
            throw new CustomException(ErrorCode.NO_COMMON_DATES);
        }

        // 전원 가능한 날짜 목록
        List<LocalDate> commonDates = getCommonDates(totalMemberCount);

        if (commonDates.isEmpty()) {
            throw new CustomException(ErrorCode.NO_COMMON_DATES);
        }

        List<Object[]> results = availableDateRepository.findDatesWithMemberNames();

        // 날짜별 선택 멤버 수 카운트
        Map<LocalDate, Long> dateCountMap = new LinkedHashMap<>();
        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            dateCountMap.merge(date, 1L, Long::sum);
        }

        // 전원 가능한 날짜만 필터링 후 반환
        return dateCountMap.entrySet().stream()
                .filter(entry -> entry.getValue() == totalMemberCount)
                .map(entry -> new DateResultResponse(entry.getKey()))
                .sorted(Comparator.comparing(DateResultResponse::date))
                .toList();
    }

    /**
     * 날짜 확정 및 변경 통합 (방장만 가능)
     * 확정 전 → 날짜 확정
     * 확정 후 → 날짜 변경
     */
    @Transactional
    public ConfirmDateResponse confirmOrUpdateDate(UUID memberId, ConfirmDateRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 전원 날짜 선택 확인
        long totalMemberCount = memberRepository.count();
        long selectedMemberCount = availableDateRepository.countDistinctMember();
        if (totalMemberCount != selectedMemberCount) {
            throw new CustomException(ErrorCode.NOT_ALL_MEMBERS_SELECTED);
        }

        // 전원 가능한 날짜 목록 조회
        List<LocalDate> commonDates = getCommonDates(totalMemberCount);
        if (commonDates.isEmpty()) {
            throw new CustomException(ErrorCode.NO_COMMON_DATES);
        }

        // 선택한 날짜가 공통 날짜 중에 있는지 확인
        if (!commonDates.contains(request.date())) {
            throw new CustomException(ErrorCode.DATE_NOT_AVAILABLE);
        }

        // 방장을 찾아서 confirmedDate 저장 (확정 날짜는 방장에게 저장)
        Member host = memberRepository.findByIsHostTrue()
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 이미 확정된 날짜와 같은 날짜인지 확인
        if (member.isConfirmed() && member.getConfirmedDate().equals(request.date())) {
            throw new CustomException(ErrorCode.SAME_DATE_CONFIRMED);
        }

        // 확정 전 여부를 미리 저장
        boolean wasConfirmed = host.isConfirmed();

        host.confirmDate(request.date());
        memberRepository.save(host);

        // wasConfirmed로 판단
        String message = wasConfirmed ? "날짜가 변경되었습니다" : "날짜가 확정되었습니다";
        return new ConfirmDateResponse(request.date(), message);
    }

    // 전원이 선택한 공통 날짜 목록 추출
    private List<LocalDate> getCommonDates(long totalMemberCount) {
        List<Object[]> results = availableDateRepository.findDatesWithMemberNames();

        Map<LocalDate, Long> dateCountMap = new LinkedHashMap<>();
        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            dateCountMap.merge(date, 1L, Long::sum);
        }

        return dateCountMap.entrySet().stream()
                .filter(entry -> entry.getValue() == totalMemberCount)
                .map(Map.Entry::getKey)
                .toList();
    }

    // 확정된 날짜 조회
    @Transactional(readOnly = true)
    public ConfirmDateResponse getConfirmedDate() {
        // host가 없거나 확정 안 됐으면 null 반환
        return memberRepository.findByIsHostTrue()
                .filter(Member::isConfirmed)
                .map(host -> new ConfirmDateResponse(host.getConfirmedDate(), "확정된 날짜입니다"))
                .orElse(null);
    }

    // 날짜 유효성 검사
    private void validateDates(List<LocalDate> dates) {

        LocalDate today = LocalDate.now();
        LocalDate oneYearLater = today.plusYears(1);

        // 중복 날짜 확인
        long distinctCount = dates.stream().distinct().count();
        if (distinctCount != dates.size()) {
            throw new CustomException(ErrorCode.DUPLICATE_DATE_NOT_ALLOWED);
        }

        for (LocalDate date : dates) {
            // 오늘 이전 날짜 확인
            if (date.isBefore(today)) {
                throw new CustomException(ErrorCode.PAST_DATE_NOT_ALLOWED);
            }
            // 1년 이후 날짜 확인
            if (date.isAfter(oneYearLater)) {
                throw new CustomException(ErrorCode.TOO_FAR_DATE_NOT_ALLOWED);
            }
        }
    }

    // confirmedDate 리셋
    @Transactional
    public void resetConfirmedDate() {
        Member host = memberRepository.findByIsHostTrue()
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));
        host.confirmDate(null);
        memberRepository.save(host);
    }
}