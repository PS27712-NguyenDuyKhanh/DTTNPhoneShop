package com.phonestore.controller;

import com.phonestore.dto.UpdateUserRequest;
import com.phonestore.entity.User;
import com.phonestore.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // lấy profile
    @GetMapping("/profile")
    public User getProfile(HttpServletRequest request){
        return userService.getProfile(request);
    }

    // update thông tin
    @PutMapping("/profile")
    public User updateProfile(HttpServletRequest request,
                              @RequestBody UpdateUserRequest req){
        return userService.updateProfile(request, req);
    }
}