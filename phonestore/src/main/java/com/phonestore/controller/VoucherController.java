package com.phonestore.controller;

import com.phonestore.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/voucher")
@RequiredArgsConstructor
@CrossOrigin
public class VoucherController {

    private final VoucherService voucherService;

    // =========================
    // CLAIM VOUCHER
    // =========================
    @PostMapping("/claim/{id}")
    public void claim(@PathVariable Long id, Principal principal){

        if(principal == null){
            throw new RuntimeException("Unauthorized");
        }

        voucherService.claim(principal.getName(), id);
    }

    // =========================
    // APPLY VOUCHER
    // =========================
    @PostMapping("/apply")
    public double apply(@RequestParam String code,
                        @RequestParam double total,
                        Principal principal){

        if(principal == null){
            throw new RuntimeException("Unauthorized");
        }

        return voucherService.apply(principal.getName(), code, total);
    }
}