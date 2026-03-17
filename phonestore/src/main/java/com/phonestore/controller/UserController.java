package com.phonestore.controller;

import com.phonestore.dto.UpdateUserRequest;
import com.phonestore.entity.User;
import com.phonestore.repository.UserRepository;
import com.phonestore.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserController(UserRepository userRepository,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // lấy profile
    @GetMapping("/profile")
    public User getProfile(HttpServletRequest request){

        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);

        String email = jwtService.extractEmail(token);

        return userRepository.findByEmail(email).orElseThrow();
    }

    // update thông tin
    @PutMapping("/profile")
    public User updateProfile(HttpServletRequest request,
                              @RequestBody UpdateUserRequest req){

        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);

        String email = jwtService.extractEmail(token);

        User user = userRepository.findByEmail(email).orElseThrow();

        user.setUsername(req.getUsername());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());

        return userRepository.save(user);
    }
}