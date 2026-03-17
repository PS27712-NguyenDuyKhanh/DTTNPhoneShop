package com.phonestore.mapper;

import com.phonestore.dto.CartDTO;
import com.phonestore.dto.CartItemDTO;
import com.phonestore.entity.Cart;
import com.phonestore.entity.CartItem;

import java.util.List;

public class CartMapper {

    // map CartItem → DTO
    public static CartItemDTO toDTO(CartItem item) {

        CartItemDTO dto = new CartItemDTO();

        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());

        dto.setVariantId(item.getVariant().getId());
        dto.setProductName(item.getVariant().getProduct().getName());
        dto.setPrice(item.getVariant().getPrice());

        // 🔥 lấy ảnh từ Image entity
        if (item.getVariant().getImages() != null &&
                !item.getVariant().getImages().isEmpty()) {

            dto.setImage(item.getVariant().getImages().get(0).getImageUrl());
        }

        dto.setTotal(item.getVariant().getPrice() * item.getQuantity());

        return dto;
    }

    // map List CartItem → CartDTO
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