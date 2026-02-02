package com.breadShop.XXI.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.breadShop.XXI.entity.EmailOtp;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

   // ใช้ตอน verify OTP
   Optional<EmailOtp> findByTokenAndUsedFalse(String token);

   // ใช้ตอน reset password หลัง verify ผ่านแล้ว
   Optional<EmailOtp> findByTokenAndUsedTrue(String token);

   // กัน spam / resend
   void deleteByEmailAndPurposeAndUsedFalse(String email, String purpose);

   // cleanup OTP หมดอายุ
   void deleteByExpiresAtBefore(LocalDateTime time);
}
