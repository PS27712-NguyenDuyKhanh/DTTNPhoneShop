package com.phonestore.service;

import com.phonestore.dto.OrderDTO;
import com.phonestore.dto.OrderRequest;
import com.phonestore.entity.*;
import com.phonestore.mapper.OrderMapper;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    // =========================
    // CHECKOUT (USER)
    // =========================
    @Transactional
    public OrderDTO checkout(String email, OrderRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 🔥 CREATE ORDER
        Order order = new Order();
        order.setUser(user);
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());

        // status + createdAt đã auto bởi @PrePersist

        order = orderRepository.save(order);

        double total = 0;

        // 🔥 CREATE ORDER ITEMS
        for (CartItem ci : cartItems) {

            OrderItem oi = new OrderItem();

            oi.setOrder(order);
            oi.setVariant(ci.getVariant());
            oi.setQuantity(ci.getQuantity());

            double price = ci.getVariant().getPrice();
            oi.setPrice(price);

            total += price * ci.getQuantity();

            orderItemRepository.save(oi);
        }

        // 🔥 SET TOTAL
        order.setTotal(total);
        orderRepository.save(order);

        // 🔥 CLEAR CART
        cartItemRepository.deleteAll(cartItems);

        // 🔥 RETURN DTO (FIX)
        return OrderMapper.toDTO(order);
    }

    // =========================
    // ADMIN - GET ALL
    // =========================
    public List<OrderDTO> getAll() {

        return orderRepository.findAll()
                .stream()
                .map(OrderMapper::toDTO)
                .toList();
    }

    // =========================
    // ADMIN - GET DETAIL
    // =========================
    public OrderDTO getById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return OrderMapper.toDTO(order);
    }

    // =========================
    // ADMIN - UPDATE STATUS
    // =========================
    public void updateStatus(Long id, OrderStatus status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        orderRepository.save(order);
    }
}