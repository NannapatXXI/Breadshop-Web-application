package com.breadShop.XXI.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.breadShop.XXI.dto.AuthenticationResponse;
import com.breadShop.XXI.dto.CheckEmailRequest;
import com.breadShop.XXI.dto.LoginRequest;
import com.breadShop.XXI.dto.OtpResult;
import com.breadShop.XXI.dto.RegisterRequest;
import com.breadShop.XXI.entity.RefreshToken;
import com.breadShop.XXI.entity.User;
import com.breadShop.XXI.repository.EmailOtpRepository;
import com.breadShop.XXI.repository.UserRepository;

import jakarta.transaction.Transactional;

//สำหรับการสมัครผ่านหน้าเว็บ
@Service
public class AuthService {

   
    private  final UserRepository userRepository;

    private final EmailOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

   
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
   
    private  final JwtService jwtService;

    private final Mailservice mailService;

    private final OtpService otpService;
    
    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
             JwtService jwtService,
             EmailOtpRepository otpRepository,
            Mailservice mailService,
            OtpService otpService,
            RefreshTokenService refreshTokenService
    ) {
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.otpService = otpService;
        this.otpRepository = otpRepository;
        this.refreshTokenService = refreshTokenService;
    }



    //อาจจะต้องมาแก้ ยังไม่ได้ test bug
    public void registerUser(RegisterRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("USERNAME_EXISTS");
        }
    
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("EMAIL_EXISTS");
        }
    
        User user = new User(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password())
        );
    
        user.setRole("USER"); // 👈 สำคัญ
    
        userRepository.save(user);
    
        mailService.sendWelcomeEmail(request.email(), request.username());
    }
    

    // ------------------ Login ------------------
    /**
     * เอาไว้รับ login request แล้วส่ง token กลับไป โดยจะตรวจสอบ username กับ password ผ่าน AuthenticationManager 
     * @param request รับ LoginRequest ที่มี usernameOrEmail กับ password
     * @return ส่ง token ,username , email กลับไป
     */
    public AuthenticationResponse loginUser(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.usernameOrEmail(),
                        request.password()
                )
        );
    
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    
        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
    
        // 1. access token (อายุสั้น)
        String accessToken = jwtService.generateToken(userDetails);
    
        // 2. refresh token (อายุยาว + save DB)
        RefreshToken refreshToken = refreshTokenService.create(user);
    
        return new AuthenticationResponse(
                accessToken,
                refreshToken.getToken(),
                user.getUsername(),
                user.getEmail()
        );
    }
    

    // ------------------ checkEmail ------------------
    public void checkEmail(CheckEmailRequest request) {

        if (request.email() == null || request.email().isEmpty()) {
            throw new IllegalArgumentException("Email ไม่ควรเป็นค่าว่าง");
        }

        System.out.println("Email ที่รับมา = " + request.email());

        if (userRepository.findByEmail(request.email()).isEmpty()) {
            throw new IllegalArgumentException("ไม่มี Email นี้ ในระบบ");
           
        }

       
    }


     // ------------------ resetPassword ------------------
    /**
     * ใช้ตอน reset password เพื่อเอา password ใหม่ไปเก็บใน DB และจะมีการเปลี่ยนสถานะ token เป็นใช้แล้ว
     * @param token เอา token ไปค้นหา email ที่เกี่ยวข้อง
     * @param newPassword รหัสผ่านใหม่ที่ผู้ใช้ต้องการตั้งที่เช็คเงื่อนไขแล้วจาก frontend 
     */
     @Transactional
     public void resetPassword(String token, String newPassword) {
        String email = otpService.validateResetToken(token);
         
        System.out.println(" eamil ที่ ตรงกับ token ที่ส่งเข้ามา :"+email);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        user.setPassword(passwordEncoder.encode(newPassword));

        otpService.invalidateToken(token);
        
     }
 

     // ------------------ seadOTP ------------------
     /**
      * ใช้ตอนส่ง OTP เพื่อ reset password
      * @param email mail ที่จะส่ง OTP เพื่อใช้ reset password
      * @return คืนค่า token ที่ใช้ระบุ OTP ที่สร้างขึ้น
      */
    @Transactional
    public String sendResetPasswordOtp(String email) {

        if (!userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("EMAIL_NOT_FOUND");
        }

        otpRepository.deleteByEmailAndPurposeAndUsedFalse(
            email, "RESET_PASSWORD"
        );

        OtpResult result = otpService.generateOtp(email, "RESET_PASSWORD");
        mailService.sendOtpEmail(email, result.plainOtp());

        return result.token();
    }


     // ------------------ verify OTP ------------------
     /**
      * ใช้ตอน verify OTP
      * @param token เอา token ไปค้นหารหัส OTP ที่เก็บไว้
      * @param otp รหัส OTP ที่ผู้ใช้กรอกมา
      * @return คืนค่า token เดิมกลับไป
      */
     @Transactional
    public String verifyOtp(String token ,String otp) {


        otpService.verifyOtp(token, otp);
        System.out.println("Otp ที่ได้รับมา = " + otp);


        return token;
    }

    
}
