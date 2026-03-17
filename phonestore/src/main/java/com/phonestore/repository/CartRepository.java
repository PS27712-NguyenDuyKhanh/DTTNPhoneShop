package com.phonestore.repository;

import com.phonestore.entity.Cart;
import com.phonestore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    // tìm cart theo user
    Optional<Cart> findByUser(User user);
}