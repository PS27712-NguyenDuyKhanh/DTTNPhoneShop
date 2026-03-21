package com.phonestore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;            // SALE10

    private double discount;        // 10 (% hoặc tiền)

    private boolean isPercent;      // true: %, false: tiền

    private double minOrderValue;   // đơn tối thiểu

    private double maxDiscount;     // giảm tối đa

    private int quantity;           // tổng số

    private int used;               // đã dùng

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private boolean active;
}