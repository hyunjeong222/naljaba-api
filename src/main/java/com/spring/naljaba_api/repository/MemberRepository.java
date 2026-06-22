package com.spring.naljaba_api.repository;

import com.spring.naljaba_api.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {
    // 방장 존재 여부 확인
    boolean existsByIsHostTrue();

    // 중복 이름 확인
    boolean existsByName(String name);

    // 방장 조회
    Optional<Member> findByIsHostTrue();

    // availableDates 함께 조회 (N+1 방지)
    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.availableDates ORDER BY m.createdAt ASC")
    List<Member> findAllWithDates();
}
