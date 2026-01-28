package com.breadShop.XXI.controller;

import com.breadShop.XXI.dto.LoginRequest;
import com.breadShop.XXI.dto.RegisterRequest;
import com.breadShop.XXI.entity.User;
import com.breadShop.XXI.repository.UserRepository;
import com.breadShop.XXI.service.AuthService;
import com.breadShop.XXI.service.GoogleAuthService;


import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000") 
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService, UserRepository userRepository) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.userRepository = userRepository;
    }

    // ------------------ Login ------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        return authService.loginUser(loginRequest);
    }

    // ------------------ Register ------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        return authService.registerUser(registerRequest);
    }

    // ------------------ Google Login URL ------------------
    // endpoint ให้ frontend รับ URL
    @GetMapping("/google")
    public ResponseEntity<Map<String,String>> googleLogin() {
        return ResponseEntity.ok(Map.of(
                "url", googleAuthService.getGoogleLoginUrl()
        ));
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> callback(@RequestParam("code") String code) {
        try {
            System.out.println("1. ได้รับ Code จาก Google: " + code); // Log 1

            // แลก Code เป็น Token
            String jwt = googleAuthService.handleGoogleCallback(code);
            System.out.println("2. แลก Token สำเร็จ: " + jwt); // Log 2

            // เตรียม URL ปลายทาง 
            String redirectUrl = "http://localhost:3000/google/callback?token=" + jwt;
            
            // สร้าง Header สั่ง Redirect
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(redirectUrl));
            
            // ส่งกลับสถานะ 302 FOUND (บังคับ Browser ย้ายหน้า)
            return new ResponseEntity<>(headers, HttpStatus.FOUND);

        } catch (Exception e) {
            // ถ้าพัง ให้ปริ้น Error ออกมาดูที่ Console
            System.err.println("เกิดข้อผิดพลาด!!!");
            e.printStackTrace();
            
            // ส่ง Error กลับไปบอก Frontend (จะได้ไม่โหลดไฟล์ว่างๆ)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Login Error: " + e.getMessage());
        }
    }

     @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                                  .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
            "email", user.getEmail(),
            "username", user.getUsername(),
            "role", user.getRole()
        ));
    }

}
