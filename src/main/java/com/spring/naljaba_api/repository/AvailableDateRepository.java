package com.spring.naljaba_api.repository;

import com.spring.naljaba_api.domain.date.AvailableDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AvailableDateRepository extends JpaRepository<AvailableDate, UUID> {
    // 특정 멤버의 날짜 전체 조회
    List<AvailableDate> findByMemberId(UUID memberId);

    // 날짜 재선택 시 기존 날짜 모두 지우고 새로 저장
    @Modifying
    @Query("DELETE FROM AvailableDate a WHERE a.member.id = :memberId")
    void deleteByMemberId(@Param("memberId") UUID memberId);

    // 날짜를 선택한 멤버 수 조회
    @Query("SELECT COUNT(DISTINCT a.member.id) FROM AvailableDate a")
    long countDistinctMember();

    // 날짜별 멤버 이름 조회
    @Query("SELECT a.date, a.member.name FROM AvailableDate a ORDER BY a.date")
    List<Object[]> findDatesWithMemberNames();
}
