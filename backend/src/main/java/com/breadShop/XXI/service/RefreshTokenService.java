package com.breadShop.XXI.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.breadShop.XXI.entity.RefreshToken;
import com.breadShop.XXI.entity.User;
import com.breadShop.XXI.repository.RefreshTokenRepository;


@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    public RefreshToken create(User user) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusDays(7));
        return repo.save(token);
    }

    public RefreshToken validate(String token) {
        RefreshToken rt = repo.findByTokenAndRevokedFalse(token)
            .orElseThrow(() -> new RuntimeException("INVALID_REFRESH_TOKEN"));

        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            rt.setRevoked(true);
            repo.save(rt);
            throw new RuntimeException("REFRESH_TOKEN_EXPIRED");
        }

        return rt;
    }

    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        repo.save(token);
    }
}
