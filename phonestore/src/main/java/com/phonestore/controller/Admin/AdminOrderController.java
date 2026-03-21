package com.phonestore.controller;

import com.phonestore.dto.OrderDTO;
import com.phonestore.entity.OrderStatus;
import com.phonestore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@CrossOrigin
public class AdminOrderController {

    private final OrderService orderService;

    // =========================
    // GET ALL ORDERS
    // =========================
    @GetMapping
    public List<OrderDTO> getAllOrders() {
        return orderService.getAll();
    }

    // =========================
    // GET ORDER DETAIL
    // =========================
    @GetMapping("/{id}")
    public OrderDTO getOrderById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    // =========================
    // UPDATE STATUS
    // =========================
    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable Long id,
                             @RequestParam OrderStatus status) {

        orderService.updateStatus(id, status);
    }
}