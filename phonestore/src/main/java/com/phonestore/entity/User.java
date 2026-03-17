package com.phonestore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String username;

    private String phone;

    private String address;

    // USER / ADMIN
    private String role;

    // xác thực email
    private Boolean verified;

    // khóa / mở tài khoản
    private Boolean active;

}