package com.breadShop.XXI.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.breadShop.XXI.dto.ErrorResponse;

//* เอาไว้จัดการ exception */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("Username หรือ Password ไม่ถูกต้อง"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex) {

        return switch (ex.getMessage()) {
            case "USER_NOT_FOUND" ->
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("ไม่พบผู้ใช้ในระบบ"));
            case "EMAIL_NOT_FOUND" ->
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("ไม่พบ Email ในระบบ"));

            case "USERNAME_EXISTS" ->
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("มีชื่อผู้ใช้นี้ในระบบแล้ว"));

            case "OTP_NOT_FOUND" ->
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("OTP ไม่ถูกต้อง"));

            case "OTP_EXPIRED" ->
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("OTP หมดเวลา"));

            case "OTP_INVALID" ->
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("OTP ไม่ถูกต้อง"));
    
            default ->
                ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("ข้อมูลไม่ถูกต้อง"));
        };
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOther(Exception ex) {
        ex.printStackTrace(); // log only
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("เกิดข้อผิดพลาดในระบบ"));
    }
}
