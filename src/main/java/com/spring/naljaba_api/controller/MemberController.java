package com.spring.naljaba_api.controller;

import com.spring.naljaba_api.domain.member.MemberService;
import com.spring.naljaba_api.dto.request.CreateMemberRequest;
import com.spring.naljaba_api.dto.response.MemberResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    // 회원 생성
    @PostMapping
    public ResponseEntity<MemberResponse> createMember(
            @Valid @RequestBody CreateMemberRequest request) {

        return ResponseEntity.ok(memberService.createMember(request));
    }

    // 전체 회원 조회
    @GetMapping
    public ResponseEntity<List<MemberResponse>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }
}