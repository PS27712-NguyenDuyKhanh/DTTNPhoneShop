package com.phonestore.controller;

import com.phonestore.dto.OrderDTO;
import com.phonestore.dto.OrderRequest;
import com.phonestore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public OrderDTO checkout(@RequestBody OrderRequest request,
                             Principal principal) {

        return orderService.checkout(principal.getName(), request);
    }

    @GetMapping
    public List<OrderDTO> getMyOrders(Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        return orderService.getMyOrders(principal.getName());
    }

    // =========================
    // GET ORDER DETAIL
    // =========================
    @GetMapping("/{id}")
    public OrderDTO getDetail(@PathVariable Long id,
                              Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        return orderService.getMyOrderDetail(principal.getName(), id);
    }
}