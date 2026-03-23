package com.phonestore.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderId;
    private String method; // COD, MOMO, VNPAY
}