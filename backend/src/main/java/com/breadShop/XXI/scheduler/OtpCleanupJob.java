package com.breadShop.XXI.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.breadShop.XXI.repository.EmailOtpRepository;

@Component
public class OtpCleanupJob {

    private final EmailOtpRepository repo;

    public OtpCleanupJob(EmailOtpRepository repo) {
        this.repo = repo;
    }

    // รันทุก 10 นาที
    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void cleanExpiredOtp() {
        int deleted = repo.deleteExpired(LocalDateTime.now());
        if (deleted > 0) {
            System.out.println("🧹 Deleted expired OTP: " + deleted);
        }
    }
}
