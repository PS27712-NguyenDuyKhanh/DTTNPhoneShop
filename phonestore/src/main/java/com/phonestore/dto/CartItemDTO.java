package com.phonestore.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {

    private Long id;

    private Long variantId;

    private String productName;

    private String image;

    private double price;

    private int quantity;

    private double total;
}