package com.phonestore.repository;

import com.phonestore.entity.Cart;
import com.phonestore.entity.CartItem;
import com.phonestore.entity.Variant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // lấy tất cả item theo cart
    List<CartItem> findByCart(Cart cart);

    // 🔥 QUAN TRỌNG: fix duplicate
    Optional<CartItem> findByCartAndVariant(Cart cart, Variant variant);

    void deleteAllByCart(Cart cart);
}