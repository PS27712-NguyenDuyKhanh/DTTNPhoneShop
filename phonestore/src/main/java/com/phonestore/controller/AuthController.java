package com.phonestore.controller;

import com.phonestore.dto.CreatePasswordRequest;
import com.phonestore.dto.EmailRequest;
import com.phonestore.dto.LoginRequest;
import com.phonestore.dto.OtpRequest;
import com.phonestore.entity.Otp;
import com.phonestore.entity.User;
import com.phonestore.repository.OtpRepository;
import com.phonestore.repository.UserRepository;
import com.phonestore.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(OtpRepository otpRepository,
                          UserRepository userRepository,
                          JavaMailSender mailSender,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder) {

        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // gửi OTP
    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody EmailRequest request){

        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            return "Email đã được đăng ký";
        }

        String otpCode = String.valueOf((int)(Math.random()*900000)+100000);

        Otp entity = otpRepository.findByEmail(request.getEmail())
                .orElse(new Otp());

        entity.setEmail(request.getEmail());
        entity.setCode(otpCode);
        entity.setExpiredTime(System.currentTimeMillis()+300000);
        entity.setVerified(false);

        otpRepository.save(entity);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getEmail());
        message.setSubject("Verify OTP");
        message.setText("Your OTP: " + otpCode);

        mailSender.send(message);

        return "OTP sent";
    }

    // verify OTP
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody OtpRequest request){

        Otp otp = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if(!otp.getCode().equals(request.getOtp())){
            return "OTP incorrect";
        }

        if(otp.getExpiredTime() < System.currentTimeMillis()){
            return "OTP expired";
        }

        otp.setVerified(true);
        otpRepository.save(otp);

        return "OTP verified";
    }

    // tạo password
    @PostMapping("/create-password")
    public String createPassword(@RequestBody CreatePasswordRequest request){

        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            return "Email đã được đăng ký";
        }

        Otp otp = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if(!otp.isVerified()){
            return "Email chưa xác thực OTP";
        }

        User user = new User();

        String username = request.getEmail().split("@")[0];

        user.setUsername(username);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setVerified(true);

        userRepository.save(user);

        otpRepository.delete(otp);

        return "Account created";
    }

    // login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){

        Optional<User> user = userRepository.findByEmail(request.getEmail());

        if(user.isEmpty()){
            return ResponseEntity.badRequest().body("Email không tồn tại");
        }

        if(!passwordEncoder.matches(request.getPassword(), user.get().getPassword())){
            return ResponseEntity.badRequest().body("Sai mật khẩu");
        }

        String token = jwtService.generateToken(
                user.get().getEmail(),
                user.get().getRole()
        );

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.get().getRole(),
                "id", user.get().getId(),
                "username", user.get().getUsername()
        ));
    }
}