package com.phonestore.controller.Admin;

import com.phonestore.dto.VoucherDTO;
import com.phonestore.entity.Voucher;
import com.phonestore.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
@CrossOrigin
public class AdminVoucherController {

    private final VoucherService voucherService;

    // =========================
    // CREATE VOUCHER
    // =========================
    @PostMapping
    public Voucher create(@RequestBody VoucherDTO dto){
        return voucherService.create(dto);
    }

    @PutMapping("/{id}")
    public Voucher update(@PathVariable Long id,
                          @RequestBody VoucherDTO dto){

        return voucherService.update(id, dto);
    }

    // =========================
    // GET ALL VOUCHERS
    // =========================
    @GetMapping
    public List<Voucher> getAll(){
        return voucherService.getAll();
    }

    // =========================
    // DELETE (optional)
    // =========================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        voucherService.delete(id);
    }
}