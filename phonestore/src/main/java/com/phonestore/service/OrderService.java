package com.phonestore.service;

import com.phonestore.dto.OrderDTO;
import com.phonestore.dto.OrderRequest;
import com.phonestore.entity.*;
import com.phonestore.mapper.OrderMapper;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // 🔥 THÊM DÒNG NÀY
    private final VariantRepository variantRepository;

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

        String code = request.getVoucherCode();
        double total = 0;

        // =========================
        // 🔥 CREATE ORDER TRƯỚC
        // =========================
        Order order = new Order();
        order.setUser(user);
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());

        order = orderRepository.save(order);

        // =========================
        // 🔥 CREATE ITEMS + TÍNH TOTAL + TRỪ KHO
        // =========================
        for (CartItem ci : cartItems) {

            Variant v = ci.getVariant();

            // 🔥 CHECK HẾT HÀNG
            if (v.getStock() <= 0) {
                throw new RuntimeException("Sản phẩm đã hết hàng");
            }

            // 🔥 CHECK KHÔNG ĐỦ HÀNG
            if (v.getStock() < ci.getQuantity()) {
                throw new RuntimeException("Sản phẩm không đủ hàng");
            }

            // 🔥 TRỪ SỐ LƯỢNG
            v.setStock(v.getStock() - ci.getQuantity());
            variantRepository.save(v); // 🔥 QUAN TRỌNG

            double price;

            // 🔥 LOGIC SALE GIỮ NGUYÊN
            if (v.getSalePrice() != null &&
                    v.getSaleStart() != null &&
                    v.getSaleEnd() != null &&
                    LocalDateTime.now().isAfter(v.getSaleStart()) &&
                    LocalDateTime.now().isBefore(v.getSaleEnd())) {

                price = v.getSalePrice();
            } else {
                price = v.getPrice();
            }

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setVariant(v);
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(price);

            total += price * ci.getQuantity();

            orderItemRepository.save(oi);
        }

        // =========================
        // 🔥 APPLY VOUCHER
        // =========================
        double discount = 0;

        if (code != null && !code.isEmpty()) {
            discount = voucherService.apply(email, code, total);
        }

        // =========================
        // 🔥 SET ORDER FINAL
        // =========================
        order.setVoucherCode(code);
        order.setDiscount(discount);
        order.setTotal(total - discount);

        orderRepository.save(order);

        // =========================
        // 🔥 MARK VOUCHER USED
        // =========================
        if (code != null && !code.isEmpty()) {
            voucherService.markUsed(email, code);
        }

        // =========================
        // 🔥 CLEAR CART
        // =========================
        cartItemRepository.deleteAll(cartItems);

        return OrderMapper.toDTO(order);
    }

    // =========================
    // ADMIN - GET ALL
    // =========================
    public Page<OrderDTO> getAll(int page, int size) {

        return orderRepository.findAll(PageRequest.of(page, size))
                .map(OrderMapper::toDTO);
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

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Không có quyền");
        }

        return OrderMapper.toDTO(order);
    }
}