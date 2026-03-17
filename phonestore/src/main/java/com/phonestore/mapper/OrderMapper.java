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

        // 🔥 LƯU Ý: lấy giá từ OrderItem (đã chốt)
        dto.setPrice(item.getPrice());

        dto.setProductName(item.getVariant().getProduct().getName());

        // lấy ảnh từ Image entity
        if (item.getVariant().getImages() != null &&
                !item.getVariant().getImages().isEmpty()) {

            dto.setImage(
                    item.getVariant().getImages().get(0).getImageUrl()
            );
        }

        dto.setTotal(item.getPrice() * item.getQuantity());

        return dto;
    }

    // =========================
    // Order → DTO
    // =========================
    public static OrderDTO toDTO(Order order, List<OrderItem> items) {

        List<OrderItemDTO> itemDTOs = items.stream()
                .map(OrderMapper::toDTO)
                .toList();

        OrderDTO dto = new OrderDTO();

        dto.setId(order.getId());
        dto.setFullName(order.getFullName());
        dto.setPhone(order.getPhone());
        dto.setAddress(order.getAddress());
        dto.setNote(order.getNote());
        dto.setTotal(order.getTotal());

        dto.setItems(itemDTOs);

        return dto;
    }
}