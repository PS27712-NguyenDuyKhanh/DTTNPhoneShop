package com.phonestore.controller.Admin;

import com.phonestore.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    // ADMIN xác nhận thanh toán
    @PutMapping("/confirm/{orderId}")
    public ResponseEntity<?> confirm(@PathVariable Long orderId){
        try {
            paymentService.confirmPayment(orderId);
            return ResponseEntity.ok("Đã xác nhận thanh toán");
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}