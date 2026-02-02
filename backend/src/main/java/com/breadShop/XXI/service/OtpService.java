package com.breadShop.XXI.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.breadShop.XXI.dto.OtpResult;
import com.breadShop.XXI.entity.EmailOtp;
import com.breadShop.XXI.repository.EmailOtpRepository;

import jakarta.transaction.Transactional;

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
   @Transactional
    public OtpResult generateOtp(String email, String purpose) {

        String otp = String.valueOf(
            100000 + new SecureRandom().nextInt(900000)
        );

        EmailOtp entity = new EmailOtp();
        String token = UUID.randomUUID().toString();

        entity.setEmail(email);
        entity.setPurpose(purpose);
        entity.setToken(token);
        entity.setOtpHash(passwordEncoder.encode(otp));
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        entity.setUsed(false);
        entity.setAttemptCount(0);
       // entity.setCreatedAt(LocalDateTime.now());

        otpRepository.save(entity);

        return new OtpResult(token, otp);
    }


    // ------------------ verify OTP ------------------
    @Transactional
    public void verifyOtp(String token, String otpInput) {
    
        EmailOtp otp = otpRepository
            .findByTokenAndUsedFalse(token)
            .orElseThrow(() -> new RuntimeException("OTP_NOT_FOUND"));
    
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otp.setUsed(true);
            throw new RuntimeException("OTP_EXPIRED");
        }
    
        if (!passwordEncoder.matches(otpInput, otp.getOtpHash())) {
            otp.setAttemptCount(otp.getAttemptCount() + 1);
    
            if (otp.getAttemptCount() >= 5) {
                otp.setUsed(true);
                throw new RuntimeException("OTP_LOCKED");
            }
    
            throw new RuntimeException("OTP_INVALID");
        }
    
        otp.setUsed(true); // ✔ success
    }
    
}
