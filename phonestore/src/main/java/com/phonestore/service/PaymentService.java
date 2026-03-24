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

        // ❗ tránh tạo 2 payment
        if(paymentRepository.findByOrder_Id(order.getId()).isPresent()){
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

        // 🔥 đảm bảo update order khi COD / ZALO
        orderRepository.save(order);
    }

    // =========================
    // ADMIN CONFIRM PAYMENT
    // =========================
    public void confirmPayment(Long orderId){

        Payment p = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

        if(p.getStatus() == PaymentStatus.SUCCESS){
            throw new RuntimeException("Đã thanh toán rồi");
        }

        // update payment
        p.setStatus(PaymentStatus.SUCCESS);
        p.setPaidAt(LocalDateTime.now());
        paymentRepository.save(p);

        // 🔥 FIX QUAN TRỌNG NHẤT
        // load lại order từ DB (không dùng p.getOrder())
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order"));

        order.setPaid(true);
        orderRepository.save(order);
    }

    // =========================
    // CHECK STATUS
    // =========================
    public PaymentStatus getStatus(Long orderId){
        return paymentRepository.findByOrder_Id(orderId)
                .map(Payment::getStatus)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));
    }
}