package com.phonestore.repository;

import com.phonestore.entity.Order;
import com.phonestore.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    // 🔥 TOP SẢN PHẨM BÁN CHẠY
    @Query("""
    SELECT oi.variant.product.name, SUM(oi.quantity)
    FROM OrderItem oi
    WHERE oi.order.paid = true
    GROUP BY oi.variant.product.name
    ORDER BY SUM(oi.quantity) DESC
""")
    List<Object[]> topProducts(Pageable pageable);
}