package com.phonestore.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    private String username;
    private String phone;
    private String address;

}