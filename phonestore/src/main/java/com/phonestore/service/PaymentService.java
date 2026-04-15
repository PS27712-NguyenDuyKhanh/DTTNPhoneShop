package com.phonestore.service;

import com.phonestore.dto.PaymentRequest;
import com.phonestore.entity.*;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.PaymentRepository;
import com.phonestore.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final VnPayConfig config;

    // =========================
    // USER PAY
    // =========================
    public void pay(PaymentRequest req){

        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if(paymentRepository.findByOrder_Id(order.getId()).isPresent()){
            throw new RuntimeException("Đơn đã có thanh toán");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(req.getMethod());

        // COD
        if(req.getMethod().equals("COD")){
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("COD-" + UUID.randomUUID());

            order.setPaid(false);
        }

        // BANK
        else if(req.getMethod().equals("BANK")){
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("BANK-" + UUID.randomUUID());
        }

        // ZALOPAY
        else if(req.getMethod().equals("ZALOPAY")){
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId("ZALO-" + UUID.randomUUID());
            payment.setPaidAt(LocalDateTime.now());
            order.setPaid(true);
        }

        // VNPAY
        else if(req.getMethod().equals("VNPAY")){
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("VNPAY-" + UUID.randomUUID());
        }

        else{
            throw new RuntimeException("Phương thức không hợp lệ");
        }

        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    // =========================
    // CREATE VNPAY URL
    // =========================
    public String createVnPayPayment(Long orderId, String ipAddr){

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // 🔥 THÊM ĐOẠN NÀY (QUAN TRỌNG)
        if(paymentRepository.findByOrder_Id(orderId).isEmpty()){
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setMethod("VNPAY");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionId("VNPAY-" + UUID.randomUUID());

            paymentRepository.save(payment);
        }

        long amount = (long) (order.getTotal() * 100);

        Map<String, String> params = new HashMap<>();

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");

        // 🔥 FIX txnRef
        String txnRef = String.valueOf(orderId);
        params.put("vnp_TxnRef", txnRef);

        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        params.put("vnp_OrderType", "other");

        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_IpAddr", ipAddr);

        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        java.text.SimpleDateFormat formatter = new java.text.SimpleDateFormat("yyyyMMddHHmmss");

        params.put("vnp_CreateDate", formatter.format(cal.getTime()));

        cal.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(cal.getTime()));

        // sort params
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String field : fieldNames) {
            String value = params.get(field);

            if (hashData.length() > 0) {
                hashData.append("&");
                query.append("&");
            }

            String encodedValue = URLEncoder.encode(value, StandardCharsets.US_ASCII);

            hashData.append(field).append("=").append(encodedValue);
            query.append(field).append("=").append(encodedValue);
        }

        String secureHash = VnPayUtil.hmacSHA512(
                config.getHashSecret(),
                hashData.toString()
        );

        query.append("&vnp_SecureHash=").append(secureHash);

        return config.getPayUrl() + "?" + query.toString();
    }

    // =========================
    // ADMIN CONFIRM
    // =========================
    public void confirmPayment(Long orderId){

        Payment p = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment"));

        if(p.getStatus() == PaymentStatus.SUCCESS){
            throw new RuntimeException("Đã thanh toán rồi");
        }

        p.setStatus(PaymentStatus.SUCCESS);
        p.setPaidAt(LocalDateTime.now());
        paymentRepository.save(p);

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

    public void confirmVnpay(Long orderId){

        Payment payment = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());

        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaid(true);

        orderRepository.save(order);
    }
}