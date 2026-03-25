package com.phonestore.repository;

import com.phonestore.entity.Order;
import com.phonestore.entity.OrderStatus;
import com.phonestore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
    long countByStatus(OrderStatus status); // ✅ ĐÚNG
}