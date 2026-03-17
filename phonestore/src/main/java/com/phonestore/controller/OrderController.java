package com.phonestore.controller;

import com.phonestore.dto.OrderDTO;
import com.phonestore.dto.OrderRequest;
import com.phonestore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

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
}