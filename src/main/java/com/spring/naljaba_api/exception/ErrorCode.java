package com.spring.naljaba_api.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
 public enum ErrorCode {
    // Member
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 멤버입니다."),
    DUPLICATE_NAME(HttpStatus.CONFLICT, "이미 사용 중인 이름입니다.");

    private final HttpStatus status;
    private final String message;
}