package com.phonestore.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {

    private Long id;

    private String fullName;

    private String phone;

    private String address;

    private String note;

    private double total;

    private List<OrderItemDTO> items;
}