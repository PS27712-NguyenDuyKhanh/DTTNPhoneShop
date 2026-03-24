package com.phonestore.controller.Admin;

import com.phonestore.dto.VoucherDTO;
import com.phonestore.entity.Voucher;
import com.phonestore.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
    public Page<Voucher> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return voucherService.getAll(page, size);
    }

    // =========================
    // DELETE (optional)
    // =========================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        voucherService.delete(id);
    }
}