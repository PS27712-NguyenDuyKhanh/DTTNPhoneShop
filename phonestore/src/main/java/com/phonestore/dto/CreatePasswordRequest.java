package com.phonestore.dto;

import lombok.Data;

@Data
public class CreatePasswordRequest {

    private String email;

    private String password;

    private String username;

}