package com.phonestore.service;

import com.phonestore.dto.PaymentRequest;
import com.phonestore.entity.*;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    // =========================
    // MAIN PAYMENT
    // =========================
    public void pay(PaymentRequest req){

        Order order = getOrder(req.getOrderId());

        validateOrder(order);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(req.getMethod());
        payment.setPaidAt(LocalDateTime.now());

        // =========================
        // HANDLE METHOD
        // =========================
        switch (req.getMethod()) {

            case "COD" -> handleCOD(payment, order);

            case "MOMO", "VNPAY" -> handleOnline(payment, order);

            default -> throw new RuntimeException("Phương thức không hợp lệ");
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    // =========================
    // GET ORDER
    // =========================
    private Order getOrder(Long id){
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn"));
    }

    // =========================
    // VALIDATE
    // =========================
    private void validateOrder(Order order){

        if(order.getStatus() != OrderStatus.PENDING){
            throw new RuntimeException("Đơn đã thanh toán hoặc xử lý");
        }
    }

    // =========================
    // COD
    // =========================
    private void handleCOD(Payment payment, Order order){

        payment.setStatus("SUCCESS");
        payment.setTransactionId("COD-" + UUID.randomUUID());

        // COD → vẫn chưa giao hàng
        order.setStatus(OrderStatus.CONFIRMED);
    }

    // =========================
    // ONLINE (MOMO / VNPAY DEMO)
    // =========================
    private void handleOnline(Payment payment, Order order){

        // giả lập thành công
        payment.setStatus("SUCCESS");
        payment.setTransactionId("PAY-" + UUID.randomUUID());

        order.setStatus(OrderStatus.CONFIRMED);
    }
}