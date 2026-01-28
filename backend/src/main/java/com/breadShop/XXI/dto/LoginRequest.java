package com.breadShop.XXI.dto;

// (ใช้สำหรับรับ JSON ตอน Login)
public record LoginRequest(String usernameOrEmail, String password) {}