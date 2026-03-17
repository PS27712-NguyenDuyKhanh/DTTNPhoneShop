package com.phonestore.config;

import com.phonestore.entity.User;
import com.phonestore.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {

        return args -> {

            if(userRepository.findByEmail("admin@gmail.com").isEmpty()){

                User admin = new User();

                admin.setEmail("admin@gmail.com");
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole("ADMIN");
                admin.setVerified(true);

                userRepository.save(admin);

                System.out.println("Admin account created");
            }
        };
    }
}