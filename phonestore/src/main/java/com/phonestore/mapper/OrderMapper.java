package com.phonestore.mapper;

import com.phonestore.dto.OrderDTO;
import com.phonestore.dto.OrderItemDTO;
import com.phonestore.entity.Order;
import com.phonestore.entity.OrderItem;

import java.util.List;

public class OrderMapper {

    // =========================
    // OrderItem → DTO
    // =========================
    public static OrderItemDTO toDTO(OrderItem item) {

        OrderItemDTO dto = new OrderItemDTO();

        dto.setVariantId(item.getVariant().getId());
        dto.setQuantity(item.getQuantity());

        // giá đã chốt
        dto.setPrice(item.getPrice());

        dto.setProductName(
                item.getVariant().getProduct().getName()
        );

        // ảnh
        if (item.getVariant().getImages() != null &&
                !item.getVariant().getImages().isEmpty()) {

            dto.setImage(
                    item.getVariant().getImages().get(0).getImageUrl()
            );
        }

        // tổng item
        dto.setTotal(item.getPrice() * item.getQuantity());

        return dto;
    }

    // =========================
    // Order → DTO
    // =========================
    public static OrderDTO toDTO(Order order) {

        OrderDTO dto = new OrderDTO();

        dto.setId(order.getId());
        dto.setFullName(order.getFullName());
        dto.setPhone(order.getPhone());
        dto.setAddress(order.getAddress());
        dto.setNote(order.getNote());
        dto.setTotal(order.getTotal());

        // 🔥 VOUCHER
        dto.setVoucherCode(order.getVoucherCode());
        dto.setDiscount(order.getDiscount());

        // 🔥 ADMIN INFO
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        // username
        if (order.getUser() != null) {
            dto.setUsername(order.getUser().getUsername());
        }

        // =========================
        // ITEMS (NULL SAFE)
        // =========================
        List<OrderItemDTO> itemDTOs;

        if (order.getItems() == null) {
            itemDTOs = List.of();
        } else {
            itemDTOs = order.getItems()
                    .stream()
                    .map(OrderMapper::toDTO)
                    .toList();
        }

        dto.setItems(itemDTOs);

        return dto;
    }
}