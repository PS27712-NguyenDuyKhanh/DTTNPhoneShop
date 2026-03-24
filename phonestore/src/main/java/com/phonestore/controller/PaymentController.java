package com.phonestore.controller;

import com.phonestore.dto.PaymentRequest;
import com.phonestore.entity.PaymentStatus;
import com.phonestore.entity.VnPayConfig;
import com.phonestore.service.PaymentService;
import com.phonestore.util.VnPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final VnPayConfig config;

    // =========================
    // USER thanh toán (COD/ZALO giả lập)
    // =========================
    @PostMapping
    public ResponseEntity<?> pay(@RequestBody PaymentRequest req){
        try {
            paymentService.pay(req);
            return ResponseEntity.ok("Thanh toán thành công");
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================
    // CHECK STATUS
    // =========================
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getStatus(@PathVariable Long orderId){
        try {
            PaymentStatus status = paymentService.getStatus(orderId);
            return ResponseEntity.ok(status);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // =========================
    // CREATE VNPAY
    // =========================
    @GetMapping("/vnpay")
    public ResponseEntity<?> createPayment(@RequestParam Long orderId,
                                           HttpServletRequest request){

        String ip = request.getRemoteAddr();

        String url = paymentService.createVnPayPayment(orderId, ip);

        return ResponseEntity.ok(Map.of("url", url));
    }

    // =========================
    // 🔥 VNPAY RETURN (QUAN TRỌNG)
    // =========================
    @GetMapping("/vnpay-return")
    public String vnpayReturn(@RequestParam Map<String, String> params){

        String vnpSecureHash = params.get("vnp_SecureHash");

        // ❌ remove hash khỏi params trước khi build lại
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        // 🔥 build lại hashData
        String hashData = VnPayUtil.buildHashData(params);

        String checkHash = VnPayUtil.hmacSHA512(
                config.getHashSecret(),
                hashData
        );

        // ❌ nếu sai chữ ký → reject
        if(!checkHash.equalsIgnoreCase(vnpSecureHash)){
            return "<script>alert('Sai chữ ký VNPay!');window.location.href='http://127.0.0.1:5500/html/payment.html'</script>";
        }

        // ✅ đúng chữ ký → xử lý tiếp
        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        if("00".equals(responseCode)){
            Long orderId = Long.parseLong(txnRef);

            paymentService.confirmVnpay(orderId);

            return "<script>window.location.href='http://127.0.0.1:5500/html/success.html?orderId=" + orderId + "'</script>";
        }

        return "<script>alert('Thanh toán thất bại');window.location.href='http://127.0.0.1:5500/html/payment.html?orderId=" + txnRef + "'</script>";
    }
}