package com.spring.naljaba_api.dto.response;

import com.spring.naljaba_api.domain.member.Member;

import java.time.LocalDateTime;
import java.util.UUID;

public record MemberResponse (
    UUID memberId,
    String name,
    String profileColor,
    boolean isHost,
    LocalDateTime createdAt,
    boolean hasSaved
) {
    public static MemberResponse from(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getName(),
                member.getProfileColor(),
                member.isHost(),
                member.getCreatedAt(),
                !member.getAvailableDates().isEmpty()
        );
    }
}