package com.breadShop.XXI.dto;

// (ใช้สำหรับส่ง JSON ตอบกลับตอน Login สำเร็จ)
public record LoginResponse(String message, String token) {}