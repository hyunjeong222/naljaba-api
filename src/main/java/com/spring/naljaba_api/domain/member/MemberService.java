package com.spring.naljaba_api.domain.member;

import com.spring.naljaba_api.dto.request.CreateMemberRequest;
import com.spring.naljaba_api.dto.response.MemberResponse;
import com.spring.naljaba_api.exception.CustomException;
import com.spring.naljaba_api.exception.ErrorCode;
import com.spring.naljaba_api.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {
    private final MemberRepository memberRepository;

    // 회원 생성
    @Transactional
    public MemberResponse createMember(CreateMemberRequest request) {
        // 중복 이름 확인
        if (memberRepository.existsByName(request.name())) {
            throw new CustomException(ErrorCode.DUPLICATE_NAME);
        }

        // 방장 없으면 첫 번째 멤버 = 방장
        boolean isHost = !memberRepository.existsByIsHostTrue();

        Member member = memberRepository.save(
                Member.create(request.name(), isHost)
        );

        return MemberResponse.from(member);
    }

    // 전체 회원 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAll()
                .stream()
                .map(MemberResponse::from)
                .toList();
    }
}