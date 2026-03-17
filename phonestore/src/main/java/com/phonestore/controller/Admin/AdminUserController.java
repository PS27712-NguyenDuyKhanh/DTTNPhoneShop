package com.phonestore.controller.Admin;

import com.phonestore.entity.User;
import com.phonestore.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // lấy danh sách user
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // xem chi tiết user
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // khóa / mở user
    @PutMapping("/status/{id}")
    public User changeStatus(@PathVariable Long id) {

        User user = userRepository.findById(id).orElseThrow();

        if (user.getVerified() == null) {
            user.setVerified(false);
        }

        user.setVerified(!user.getVerified());

        return userRepository.save(user);
    }

    // xóa user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }
}