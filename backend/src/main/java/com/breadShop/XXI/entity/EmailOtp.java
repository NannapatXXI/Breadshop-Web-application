package com.breadShop.XXI.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "email_otp")
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String otpHash;

    private String purpose; // RESET_PASSWORD, VERIFY_EMAIL

    private LocalDateTime expiresAt;

    private boolean used = false;

    private int attemptCount = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    public void setUsed(boolean b) {
        this.used = b;
    }
    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }
    public String getEmail() {
        return email;
    }
    public String getOtpHash() {
        return otpHash;
    }
    public String purPose() {
        return purpose;
    }
    public boolean isUsed() {
        return used;
    }
    public Integer getAttemptCount() {
        return attemptCount;
    }
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    public LocalDateTime createdAt() {
        return createdAt;
    }


  

   
}
