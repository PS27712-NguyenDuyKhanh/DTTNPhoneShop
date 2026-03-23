package com.phonestore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // COD, MOMO, VNPAY
    private String method;

    // SUCCESS, FAILED, PENDING
    private String status;

    private String transactionId; // mã giao dịch (fake hoặc thật)

    private LocalDateTime paidAt;

    // 🔗 liên kết order
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
}