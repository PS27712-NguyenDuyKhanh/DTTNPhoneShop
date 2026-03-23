package com.phonestore.controller;

import com.phonestore.dto.PaymentRequest;
import com.phonestore.entity.PaymentStatus;
import com.phonestore.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // USER thanh toán
    @PostMapping
    public ResponseEntity<?> pay(@RequestBody PaymentRequest req){
        try {
            paymentService.pay(req);
            return ResponseEntity.ok("Thanh toán thành công");
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // USER check trạng thái
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getStatus(@PathVariable Long orderId){
        try {
            PaymentStatus status = paymentService.getStatus(orderId);
            return ResponseEntity.ok(status);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}