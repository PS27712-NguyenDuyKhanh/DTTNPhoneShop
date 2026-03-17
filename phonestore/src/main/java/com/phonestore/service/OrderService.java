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
    // CHECKOUT
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

        // 🔥 TẠO ORDER
        Order order = new Order();
        order.setUser(user);
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());

        double total = 0;

        order = orderRepository.save(order);

        // 🔥 TẠO ORDER ITEM
        for (CartItem ci : cartItems) {

            OrderItem oi = new OrderItem();

            oi.setOrder(order);
            oi.setVariant(ci.getVariant());
            oi.setQuantity(ci.getQuantity());

            // 🔥 CHỐT GIÁ
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

        // 🔥 TRẢ DTO
        List<OrderItem> items = orderItemRepository.findByOrder(order);

        return OrderMapper.toDTO(order, items);
    }
}