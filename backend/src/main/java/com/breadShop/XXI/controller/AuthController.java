package com.breadShop.XXI.controller;

import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.breadShop.XXI.dto.AuthenticationResponse;
import com.breadShop.XXI.dto.CheckEmailRequest;
import com.breadShop.XXI.dto.ErrorResponse;
import com.breadShop.XXI.dto.LoginRequest;
import com.breadShop.XXI.dto.RegisterRequest;
import com.breadShop.XXI.dto.ResetPasswordRequest;
import com.breadShop.XXI.dto.VerifyOtpRequest;
import com.breadShop.XXI.entity.User;
import com.breadShop.XXI.repository.UserRepository;
import com.breadShop.XXI.service.AuthService;
import com.breadShop.XXI.service.GoogleAuthService;
import com.breadShop.XXI.service.Mailservice;

import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final UserRepository userRepository;
    private final Mailservice mailservice;
   
    

    public AuthController(AuthService authService, GoogleAuthService googleAuthService, UserRepository userRepository,Mailservice mailservice) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.userRepository = userRepository;
        this.mailservice = mailservice;
       
    }

    // ------------------ Refresh Token ------------------
    /**
     * เอาไว้ให้ refresh access token
     * @param request 
     * @return
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {

       String newAccessToken = authService.refreshAccessToken(request);

        ResponseCookie accessCookie = ResponseCookie
            .from("access_token", newAccessToken)
            .httpOnly(true)
            .path("/")
            .maxAge(15 * 60)
            .build();

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
            .body(Map.of("message", "refreshed"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            Map.of(
                "email", userDetails.getUsername(),
                "roles", userDetails.getAuthorities()
            )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        AuthenticationResponse tokens = authService.loginUser(loginRequest);

        // access token cookie
        ResponseCookie accessCookie = ResponseCookie.from("access_token", tokens.accessToken())
                .httpOnly(true)
                .secure(false) // true เมื่อขึ้น https
                .path("/")
                .maxAge(15 * 60) //access token อยู่ได้ 15 นาที
                .sameSite("Lax")
                .build();

        // refresh token cookie
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.refreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of("message", "login success"));
    }

    // ------------------ send OTP ------------------
    @PostMapping("/send-OTP-mail")
    public ResponseEntity<?> sendOtp(@RequestBody CheckEmailRequest request) {
        try {
            String token = authService.sendResetPasswordOtp(request.email());
    
            return ResponseEntity.ok(
                Map.of(
                    "message", "ส่ง OTP เรียบร้อย",
                    "token", token
                )
            );
    
        } catch (IllegalArgumentException e) {
            if ("EMAIL_NOT_FOUND".equals(e.getMessage())) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse("ไม่พบ Email ในระบบ"));
            }
            throw e;
        }
    }
     // ------------------ verify OTP ------------------
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {

    String token = authService.verifyOtp(
        request.token(),
        request.otp()
    );

    return ResponseEntity.ok(
        Map.of(
            "message", "OTP ถูกต้อง",
            "token", token
        )
    );
}
// ------------------ reset password ------------------
@PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request.token(), request.newPassword());
    return ResponseEntity.ok(
        Map.of("message", "Password reset successfully")
    );
}
     

    // ------------------ Register ------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        authService.registerUser(registerRequest);

        return ResponseEntity.ok(
        Map.of("message", "Register successfully")
    );
        
    }
     // ------------------ checkmail ------------------
     /* 
     @PostMapping("/checkmail")
     public ResponseEntity<?> checkpass(@RequestBody CheckEmailRequest emailRequest) {
       
        System.out.println("เข้า checkmail แล้ว: " + emailRequest.email());
        try {
            return authService.checkEmail(emailRequest);
        } catch (Exception e) {
                    System.out.println("เกิดข้อผิดพลาดใน checkmail: " + e.getMessage());
            throw e;
        }
     }*/

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
           // e.printStackTrace();
            
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
