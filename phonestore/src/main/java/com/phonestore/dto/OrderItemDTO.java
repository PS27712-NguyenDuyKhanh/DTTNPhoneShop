package com.phonestore.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long variantId;

    private String productName;

    private String image;

    private double price;

    private int quantity;

    private double total;
}