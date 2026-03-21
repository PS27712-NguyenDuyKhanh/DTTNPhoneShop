package com.phonestore.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class VoucherDTO {

    private Long id;
    private String code;
    private double discount;
    private boolean isPercent;
    private double minOrderValue;
    private double maxDiscount;
    private int quantity;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
}