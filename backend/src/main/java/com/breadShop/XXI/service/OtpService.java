package com.breadShop.XXI.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.breadShop.XXI.entity.EmailOtp;
import com.breadShop.XXI.repository.EmailOtpRepository;

@Service
public class OtpService {

    private final EmailOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    public OtpService(
            EmailOtpRepository otpRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ------------------ generate OTP ------------------
    public String generateOtp(String email, String purpose) {

        String otp = String.valueOf(
                100000 + new SecureRandom().nextInt(900000)
        );

        EmailOtp entity = new EmailOtp();
        entity.setEmail(email);
        entity.setPurpose(purpose);
        entity.setOtpHash(passwordEncoder.encode(otp));
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(entity);

        return otp; // ส่ง plain otp กลับไปให้ MailService
    }

    // ------------------ verify OTP ------------------
    public boolean verifyOtp(String email, String purpose, String otpInput) {

        EmailOtp otp = otpRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                        email, purpose
                )
                .orElseThrow(() -> new RuntimeException("OTP ไม่ถูกต้อง"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new RuntimeException("OTP หมดอายุ");
        }

        if (!passwordEncoder.matches(otpInput, otp.getOtpHash())) {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
            otpRepository.save(otp);
            throw new RuntimeException("OTP ไม่ถูกต้อง");
        }

        otp.setUsed(true);
        otpRepository.save(otp);

        return true;
    }
}
