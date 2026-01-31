package com.breadShop.XXI.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class Mailservice {

    private final JavaMailSender mailSender; //เป็น Interface ของ Spring  ทำหน้าที่ส่ง Email ผ่าน SMTP()SMTP (Simple Mail Transfer Protocol)
   

    // Constructor Injection (ปลอดภัย + Production)
    public Mailservice(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("OTP สำหรับรีเซ็ตรหัสผ่าน");
        message.setText(
                "รหัส OTP ของคุณคือ: " + otp +
                "\nรหัสนี้มีอายุ 5 นาที"
        );

        mailSender.send(message);
    }
}
