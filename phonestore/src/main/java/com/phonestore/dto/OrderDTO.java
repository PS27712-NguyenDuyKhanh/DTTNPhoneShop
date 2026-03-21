package com.phonestore.dto;

import com.phonestore.entity.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
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

    private OrderStatus status;

    private LocalDateTime createdAt;

    private String username;

    private List<OrderItemDTO> items;

    private String voucherCode;

    private Double discount;
}