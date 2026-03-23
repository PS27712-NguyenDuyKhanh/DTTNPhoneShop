package com.phonestore.controller;

import com.phonestore.dto.OrderDTO;
import com.phonestore.dto.OrderRequest;
import com.phonestore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody OrderRequest request,
                                      Principal principal) {

        OrderDTO order = orderService.checkout(principal.getName(), request);

        return ResponseEntity.ok(
                Map.of("orderId", order.getId())
        );
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