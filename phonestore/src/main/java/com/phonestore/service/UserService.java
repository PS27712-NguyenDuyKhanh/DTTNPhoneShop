package com.phonestore.service;

import com.phonestore.dto.UpdateUserRequest;
import com.phonestore.entity.User;
import com.phonestore.repository.UserRepository;
import com.phonestore.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    // lấy user từ token
    private User getUserFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token không hợp lệ");
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }

    // GET profile
    public User getProfile(HttpServletRequest request) {
        return getUserFromRequest(request);
    }

    // UPDATE profile
    public User updateProfile(HttpServletRequest request, UpdateUserRequest req) {
        User user = getUserFromRequest(request);

        user.setUsername(req.getUsername());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());

        return userRepository.save(user);
    }
}