package com.breadShop.XXI.dto;

public record AuthenticationResponse(
     String token,
     String username,
     String email
) {}
