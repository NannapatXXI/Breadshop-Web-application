package com.breadShop.XXI.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.breadShop.XXI.dto.ErrorResponse;

//* เอาไว้จัดการ exception */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex) {

        return switch (ex.getMessage()) {
            case "INVALID_CREDENTIALS" ->
                ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Username หรือ Password ไม่ถูกต้อง"));

            case "USER_NOT_FOUND" ->
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("ไม่พบผู้ใช้ในระบบ"));

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
