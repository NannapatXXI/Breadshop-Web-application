package com.breadShop.XXI.service;

import com.breadShop.XXI.dto.*;
import com.breadShop.XXI.entity.User;
import com.breadShop.XXI.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

//สำหรับการสมัครผ่านหน้าเว็บ
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    // ------------------ Register ------------------
    public ResponseEntity<?> registerUser(RegisterRequest request) {

        // ตรวจสอบซ้ำ
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Username นี้ถูกใช้ไปแล้ว"));
        }
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Email นี้ถูกใช้ไปแล้ว"));
        }

        // สร้าง User ใหม่
        User user = new User(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password())
        );

        userRepository.save(user);
       

        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "USER";
        }
        role = role.toUpperCase();

        String token = jwtService.generateToken(
            org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(role)   // ชัวร์สุด
                .build()
        );

        

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthenticationResponse(token, user.getUsername(), user.getEmail()));
    }

    // ------------------ Login ------------------
    public ResponseEntity<?> loginUser(LoginRequest request) {
         // หา user จาก DB โดยลอง username ก่อน ถ้าไม่เจอให้ลอง email
        User user = userRepository.findByUsername(request.usernameOrEmail())
        .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // ไม่ต้อง try-catch ทั่วไป เพื่อดู error จริง
        Authentication authentication = authenticationManager.authenticate(

            new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                request.password()
            )
        );
         // เก็บ Authentication ไว้ใน SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);
    
      
        // อัปเดตเวลาล็อกอินล่าสุด
        user.setLastLoginAt(LocalDateTime.now());
        
        userRepository.save(user);
    
        // สร้าง JWT token
        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "USER";
        }
        role = role.toUpperCase();

        String jwtToken = jwtService.generateToken(
            org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(role)   // ชัวร์สุด
                .build()
        );

    
        return ResponseEntity.ok(new AuthenticationResponse(jwtToken, user.getUsername(), user.getEmail()));
    }
    
}
