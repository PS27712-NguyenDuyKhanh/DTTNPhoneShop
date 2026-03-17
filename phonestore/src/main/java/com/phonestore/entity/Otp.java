package com.phonestore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String code;

    private Long expiredTime;

    private boolean verified;
}