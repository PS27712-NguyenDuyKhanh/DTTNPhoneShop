package com.phonestore.controller;

import com.phonestore.dto.CartDTO;
import com.phonestore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin
public class CartController {

    private final CartService cartService;

    // =========================
    // ADD TO CART
    // =========================
    @PostMapping("/add")
    public void add(@RequestParam Long variantId,
                    @RequestParam int quantity,
                    Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        cartService.addToCart(principal.getName(), variantId, quantity);
    }

    // =========================
    // GET CART
    // =========================
    @GetMapping
    public CartDTO get(Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        return cartService.getCart(principal.getName());
    }

    // =========================
    // UPDATE QUANTITY (🔥 đổi URL cho rõ)
    // =========================
    @PutMapping("/item/{itemId}")
    public void updateItem(@PathVariable Long itemId,
                           @RequestParam int quantity,
                           Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        cartService.updateQuantity(itemId, quantity);
    }

    // =========================
    // DELETE ITEM (🔥 đổi URL cho rõ)
    // =========================
    @DeleteMapping("/item/{itemId}")
    public void removeItem(@PathVariable Long itemId,
                           Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        cartService.removeItem(itemId);
    }

    // =========================
    // CLEAR CART (BONUS)
    // =========================
    @DeleteMapping("/clear")
    public void clearCart(Principal principal) {

        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        cartService.clearCart(principal.getName());
    }
}