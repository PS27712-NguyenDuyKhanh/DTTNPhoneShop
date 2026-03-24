package com.phonestore.controller.Admin;

import com.phonestore.dto.OrderDTO;
import com.phonestore.entity.OrderStatus;
import com.phonestore.repository.OrderRepository;
import com.phonestore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import com.phonestore.entity.OrderStatus;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@CrossOrigin
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    // =========================
    // GET ALL ORDERS
    // =========================
    @GetMapping
    public Page<OrderDTO> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return orderService.getAll(page, size);
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

    @GetMapping("/new-count")
    public long countNewOrders() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }
}