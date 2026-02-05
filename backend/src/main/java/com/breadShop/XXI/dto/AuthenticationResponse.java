package com.breadShop.XXI.dto;

public record AuthenticationResponse(
        String accessToken,
        String refreshToken,
        String username,
        String email
) {}