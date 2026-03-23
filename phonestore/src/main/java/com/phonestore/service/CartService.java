package com.phonestore.service;

import com.phonestore.dto.CartDTO;
import com.phonestore.entity.*;
import com.phonestore.mapper.CartMapper;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final VariantRepository variantRepository;

    // =========================
    // LẤY / TẠO CART
    // =========================
    public Cart getOrCreateCart(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    // =========================
    // ADD TO CART (🔥 QUAN TRỌNG)
    // =========================
    public void addToCart(String email, Long variantId, int quantity) {

        Cart cart = getOrCreateCart(email);

        Variant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        CartItem item = cartItemRepository
                .findByCartAndVariant(cart, variant)
                .orElse(null);

        // 🔥 TÍNH GIÁ THỰC TẾ
        double finalPrice = variant.getPrice();

// 🔥 nếu đang trong thời gian sale → dùng salePrice
        if (variant.getSalePrice() != null
                && variant.getSaleStart() != null
                && variant.getSaleEnd() != null) {

            LocalDateTime now = LocalDateTime.now();

            if (now.isAfter(variant.getSaleStart()) && now.isBefore(variant.getSaleEnd())) {
                finalPrice = variant.getSalePrice();
            }
        }

        if (item != null) {
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setVariant(variant);
            item.setQuantity(quantity);

            // 🔥 QUAN TRỌNG NHẤT (THÊM DÒNG NÀY)
            item.setPrice(finalPrice);
        }

        cartItemRepository.save(item);
    }

    // =========================
    // GET CART
    // =========================
    public CartDTO getCart(String email) {

        Cart cart = getOrCreateCart(email);

        // nếu bạn có query JOIN FETCH thì dùng ở đây
        List<CartItem> items = cartItemRepository.findByCart(cart);

        return CartMapper.toCartDTO(cart, items);
    }

    // =========================
    // UPDATE QUANTITY
    // =========================
    public void updateQuantity(Long itemId, int quantity) {

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setQuantity(quantity);

        cartItemRepository.save(item);
    }

    // =========================
    // DELETE ITEM
    // =========================
    public void removeItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }

    // =========================
// CLEAR CART
// =========================
    public void clearCart(String email){

        Cart cart = getOrCreateCart(email);

        // cách 1: xóa tất cả item theo cart
        cartItemRepository.deleteAllByCart(cart);
    }
}