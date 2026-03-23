package com.phonestore.controller;

import com.phonestore.dto.PaymentRequest;
import com.phonestore.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // =========================
    // THANH TOÁN
    // =========================
    @PostMapping("/payments")
    public ResponseEntity<?> pay(@RequestBody PaymentRequest req){

        try {

            paymentService.pay(req);

            return ResponseEntity.ok("Thanh toán thành công");

        } catch (RuntimeException e){

            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e){

            return ResponseEntity.internalServerError().body("Lỗi server");

        }
    }
}