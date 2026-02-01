package com.breadShop.XXI.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.breadShop.XXI.entity.EmailOtp;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
        String email,
        String purpose
    );

    void deleteByExpiresAtBefore(LocalDateTime time);
}
