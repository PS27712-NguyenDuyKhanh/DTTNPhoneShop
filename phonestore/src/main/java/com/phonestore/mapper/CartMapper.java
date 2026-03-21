package com.phonestore.mapper;

import com.phonestore.dto.CartDTO;
import com.phonestore.dto.CartItemDTO;
import com.phonestore.entity.Cart;
import com.phonestore.entity.CartItem;
import com.phonestore.entity.Variant;

import java.time.LocalDateTime;
import java.util.List;

public class CartMapper {

    // =========================
    // CartItem → DTO
    // =========================
    public static CartItemDTO toDTO(CartItem item) {

        CartItemDTO dto = new CartItemDTO();

        Variant v = item.getVariant();

        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setVariantId(v.getId());
        dto.setProductName(v.getProduct().getName());

        // =========================
        // 🔥 LOGIC GIÁ (SALE)
        // =========================
        double price;

        if (v.getSalePrice() != null &&
                v.getSaleStart() != null &&
                v.getSaleEnd() != null &&
                LocalDateTime.now().isAfter(v.getSaleStart()) &&
                LocalDateTime.now().isBefore(v.getSaleEnd())) {

            price = v.getSalePrice();
        } else {
            price = v.getPrice();
        }

        dto.setPrice(price);
        dto.setTotal(price * item.getQuantity());

        // =========================
        // 🔥 IMAGE
        // =========================
        if (v.getImages() != null && !v.getImages().isEmpty()) {
            dto.setImage(v.getImages().get(0).getImageUrl());
        }

        return dto;
    }

    // =========================
    // Cart → DTO
    // =========================
    public static CartDTO toCartDTO(Cart cart, List<CartItem> items) {

        List<CartItemDTO> itemDTOs = items.stream()
                .map(CartMapper::toDTO)
                .toList();

        double total = itemDTOs.stream()
                .mapToDouble(CartItemDTO::getTotal)
                .sum();

        CartDTO dto = new CartDTO();
        dto.setItems(itemDTOs);
        dto.setTotalAmount(total);

        return dto;
    }
}