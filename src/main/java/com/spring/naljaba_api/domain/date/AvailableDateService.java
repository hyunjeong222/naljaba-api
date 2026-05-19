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

        // 날짜 유효성 검사
        validateDates(request.dates());

        // 삭제 후 flush로 즉시 DB 반영
        availableDateRepository.deleteByMemberId(member.getId());
        availableDateRepository.flush();

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

        List<AvailableDate> availableDates =
                availableDateRepository.findByMemberId(memberId);

        if (availableDates.isEmpty()) {
            throw new CustomException(ErrorCode.AVAILABLE_DATE_NOT_FOUND);
        }

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
            throw new CustomException(ErrorCode.NOT_ALL_MEMBERS_SELECTED);
        }

        // 날짜별 멤버 이름 그룹핑
        List<Object[]> results = availableDateRepository.findDatesWithMemberNames();

        Map<LocalDate, List<String>> dateMap = new LinkedHashMap<>();
        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            String name = (String) row[1];
            // 날짜가 없으면 새 리스트 생성 후 이름 추가
            dateMap.computeIfAbsent(date, k -> new ArrayList<>()).add(name);
        }

        return dateMap.entrySet().stream()
                .map(entry -> new DateResultResponse(
                        entry.getKey(),
                        (long) entry.getValue().size(),
                        entry.getValue()
                ))
                .sorted(Comparator.comparing(DateResultResponse::date))
                .toList();
    }

    // 날짜 확정 (방장만 가능)
    @Transactional
    public ConfirmDateResponse confirmDate(UUID memberId, ConfirmDateRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 방장 확인
        if (!member.isHost()) {
            throw new CustomException(ErrorCode.NOT_HOST);
        }

        // 이미 확정된 경우
        if (member.isConfirmed()) {
            throw new CustomException(ErrorCode.ALREADY_CONFIRMED);
        }

        // 모든 멤버가 날짜를 선택했는지 확인
        long totalMemberCount = memberRepository.count();
        long selectedMemberCount = availableDateRepository.countDistinctMember();

        if (totalMemberCount != selectedMemberCount) {
            throw new CustomException(ErrorCode.NOT_ALL_MEMBERS_SELECTED);
        }

        // 집계된 날짜 중 하나인지 확인 (아무도 선택 안 한 날짜 확정 방지)
        List<LocalDate> allDates = availableDateRepository.findDatesWithMemberNames()
                .stream()
                .map(row -> (LocalDate) row[0])
                .distinct()
                .toList();

        if (!allDates.contains(request.date())) {
            throw new CustomException(ErrorCode.DATE_NOT_AVAILABLE);
        }

        member.confirmDate(request.date());
        memberRepository.save(member);

        return new ConfirmDateResponse(request.date(), "날짜가 확정되었습니다");
    }

    // 확정 날짜 변경 (방장만 가능)
    @Transactional
    public ConfirmDateResponse updateConfirmedDate(UUID memberId, ConfirmDateRequest request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 방장 확인
        if (!member.isHost()) {
            throw new CustomException(ErrorCode.NOT_HOST);
        }

        // 확정된 날짜가 없는 경우
        if (!member.isConfirmed()) {
            throw new CustomException(ErrorCode.NOT_CONFIRMED_YET);
        }

        // 같은 날짜로 변경 시도
        if (member.getConfirmedDate().equals(request.date())) {
            throw new CustomException(ErrorCode.SAME_DATE_CONFIRMED);
        }

        // 집계된 날짜 중 하나인지 확인
        List<LocalDate> allDates = availableDateRepository.findDatesWithMemberNames()
                .stream()
                .map(row -> (LocalDate) row[0])
                .distinct()
                .toList();

        if (!allDates.contains(request.date())) {
            throw new CustomException(ErrorCode.DATE_NOT_AVAILABLE);
        }

        member.confirmDate(request.date());
        memberRepository.save(member);

        return new ConfirmDateResponse(request.date(), "날짜가 변경되었습니다");
    }

    // 확정된 날짜 조회
    @Transactional(readOnly = true)
    public ConfirmDateResponse getConfirmedDate() {

        Member host = memberRepository.findByIsHostTrue()
                .orElseThrow(() -> new CustomException(ErrorCode.MEMBER_NOT_FOUND));

        // 아직 확정 안 된 경우
        if (!host.isConfirmed()) {
            throw new CustomException(ErrorCode.NOT_CONFIRMED_YET);
        }

        return new ConfirmDateResponse(host.getConfirmedDate(), "확정된 날짜입니다");
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
}