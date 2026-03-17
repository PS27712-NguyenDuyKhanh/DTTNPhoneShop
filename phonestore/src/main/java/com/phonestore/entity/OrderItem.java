package com.phonestore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;

    private double price; // 🔥 CHỐT GIÁ TẠI THỜI ĐIỂM MUA

    // many OrderItem - 1 Order
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    // many OrderItem - 1 Variant
    @ManyToOne
    @JoinColumn(name = "variant_id")
    private Variant variant;
}