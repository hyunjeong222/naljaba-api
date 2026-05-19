package com.spring.naljaba_api.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
 public enum ErrorCode {
   // Member
   MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 멤버입니다."),
   DUPLICATE_NAME(HttpStatus.CONFLICT, "이미 사용 중인 이름입니다."),
   NOT_HOST(HttpStatus.FORBIDDEN, "방장만 날짜를 확정할 수 있습니다."),
   DATE_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "해당 날짜는 선택할 수 없습니다."),
   ALREADY_CONFIRMED(HttpStatus.CONFLICT, "이미 날짜가 확정되었습니다."),
   SAME_DATE_CONFIRMED(HttpStatus.CONFLICT, "이미 확정된 날짜입니다."),

   // Date
   AVAILABLE_DATE_NOT_FOUND(HttpStatus.NOT_FOUND, "선택한 날짜가 없습니다."),
   PAST_DATE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "오늘 이전 날짜는 선택할 수 없습니다."),
   TOO_FAR_DATE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "1년 이후 날짜는 선택할 수 없습니다."),
   DUPLICATE_DATE_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "중복된 날짜가 있습니다."),
   NOT_ALL_MEMBERS_SELECTED(HttpStatus.BAD_REQUEST, "아직 날짜를 선택하지 않은 멤버가 있습니다."),
   ONLY_ONE_DATE_ALLOWED(HttpStatus.BAD_REQUEST, "날짜는 하나만 선택해주세요"),
   NO_COMMON_DATES(HttpStatus.BAD_REQUEST, "공통으로 가능한 날짜가 없습니다."),
   NOT_CONFIRMED_YET(HttpStatus.BAD_REQUEST, "아직 날짜가 확정되지 않았습니다.");

   private final HttpStatus status;
   private final String message;
}