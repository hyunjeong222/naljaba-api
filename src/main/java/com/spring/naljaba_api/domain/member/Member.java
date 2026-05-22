package com.spring.naljaba_api.domain.member;

import com.spring.naljaba_api.domain.date.AvailableDate;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 50)
    private String name;

    // 프론트에서 랜덤 배정한 색상 hex (#FF5733)
    @Column(nullable = false, length = 20)
    private String profileColor;

    @Column(name = "is_host", nullable = false)
    private boolean isHost = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AvailableDate> availableDates = new ArrayList<>();

    // 확정된 날짜 (방장이 선택)
    @Column(name = "confirmed_date")
    private LocalDate confirmedDate;

    // DB 저장 시점에 자동 기록
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public static Member create(String name, String profileColor, boolean isHost) {
        Member member = new Member();
        member.name = name;
        member.profileColor = profileColor;
        member.isHost = isHost;
        return member;
    }

    // 날짜 확정 메서드
    public void confirmDate(LocalDate date) {
        this.confirmedDate = date;
    }

    // 날짜 확정 여부 확인
    public boolean isConfirmed() {
        return this.confirmedDate != null;
    }
}