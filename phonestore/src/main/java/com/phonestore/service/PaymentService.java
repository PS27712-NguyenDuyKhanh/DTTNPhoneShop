package com.phonestore.service;

import com.phonestore.dto.PaymentRequest;
import com.phonestore.entity.*;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.PaymentRepository;
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
    // USER PAY
    // =========================
    public void pay(PaymentRequest req){

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // ❗ chỉ check đơn tồn tại thôi (không ép status)
        // vì order PENDING = chờ admin duyệt, không liên quan thanh toán

        // ❗ tránh tạo 2 payment
        if(paymentRepository.findByOrderId(order.getId()).isPresent()){
            throw new RuntimeException("Đơn đã có thanh toán");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(req.getMethod());

        // =========================
        // COD
        // =========================
        if(req.getMethod().equals("COD")){

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId("COD-" + UUID.randomUUID());
            payment.setPaidAt(LocalDateTime.now());

            order.setPaid(true);
        }

        // =========================
        // BANK
        // =========================
        else if(req.getMethod().equals("BANK")){

            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("BANK-" + UUID.randomUUID());
        }

        // =========================
        // ZALOPAY
        // =========================
        else if(req.getMethod().equals("ZALOPAY")){

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId("ZALO-" + UUID.randomUUID());
            payment.setPaidAt(LocalDateTime.now());

            order.setPaid(true);
        }

        else{
            throw new RuntimeException("Phương thức không hợp lệ");
        }

        paymentRepository.save(payment);
    }

    // =========================
    // ADMIN CONFIRM PAYMENT
    // =========================
    public void confirmPayment(Long orderId){

        Payment p = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

        if(p.getStatus() == PaymentStatus.SUCCESS){
            throw new RuntimeException("Đã thanh toán rồi");
        }

        p.setStatus(PaymentStatus.SUCCESS);
        p.setPaidAt(LocalDateTime.now());

        paymentRepository.save(p);

        // ✅ CẬP NHẬT ORDER
        Order order = p.getOrder();
        order.setPaid(true);

        orderRepository.save(order);
    }

    // =========================
    // CHECK STATUS
    // =========================
    public PaymentStatus getStatus(Long orderId){
        return paymentRepository.findByOrderId(orderId)
                .map(Payment::getStatus)
                .orElseThrow();
    }
}