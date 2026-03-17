package com.phonestore.controller;

import com.phonestore.dto.CartDTO;
import com.phonestore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public void add(@RequestParam Long variantId,
                    @RequestParam int quantity,
                    Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        cartService.addToCart(principal.getName(), variantId, quantity);
    }

    @GetMapping
    public CartDTO get(Principal principal) {
        return cartService.getCart(principal.getName());
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @RequestParam int quantity) {
        cartService.updateQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cartService.removeItem(id);
    }
}