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
    private final VoucherService voucherService;

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
        String code = request.getVoucherCode();

        double total = 0;

// tính total
        for (CartItem ci : cartItems) {
            total += ci.getVariant().getPrice() * ci.getQuantity();
        }

// apply voucher
        double discount = 0;

        if(code != null && !code.isEmpty()){
            discount = voucherService.apply(email, code, total);
        }

// create order
        Order order = new Order();
        order.setUser(user);
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());

// 🔥 THÊM 2 DÒNG
        order.setVoucherCode(code);
        order.setDiscount(discount);

        order.setTotal(total - discount);

        order = orderRepository.save(order);

// 🔥 CREATE ITEMS
        for (CartItem ci : cartItems) {

            OrderItem oi = new OrderItem();

            oi.setOrder(order);
            oi.setVariant(ci.getVariant());
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(ci.getVariant().getPrice());

            orderItemRepository.save(oi);
        }

// 🔥 MARK USED
        if(code != null && !code.isEmpty()){
            voucherService.markUsed(email, code);
        }

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

    // =========================
// USER - GET MY ORDERS
// =========================
    public List<OrderDTO> getMyOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUser(user)
                .stream()
                .map(OrderMapper::toDTO)
                .toList();
    }

    // =========================
// USER - GET ORDER DETAIL
// =========================
    public OrderDTO getMyOrderDetail(String email, Long id) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 🔥 CHẶN xem đơn người khác
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền");
        }

        return OrderMapper.toDTO(order);
    }
}