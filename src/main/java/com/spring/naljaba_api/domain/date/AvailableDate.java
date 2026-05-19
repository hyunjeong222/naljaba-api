package com.spring.naljaba_api.domain.date;

import com.spring.naljaba_api.domain.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "available_dates",
        uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "date"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AvailableDate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private LocalDate date;

    public static AvailableDate create(Member member, LocalDate date) {
        AvailableDate ad = new AvailableDate();
        ad.member = member;
        ad.date = date;
        return ad;
    }
}