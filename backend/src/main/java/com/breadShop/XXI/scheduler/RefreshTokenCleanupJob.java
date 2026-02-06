package com.breadShop.XXI.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.breadShop.XXI.repository.RefreshTokenRepository;

@Component
@EnableScheduling
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository repo;

    public RefreshTokenCleanupJob(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    // รันวันละครั้ง
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredRefreshTokens() {
        int deleted = repo.deleteExpired(LocalDateTime.now());
        if (deleted > 0) {
            System.out.println("🧹 Deleted refresh tokens: " + deleted);
        }
    }
}
