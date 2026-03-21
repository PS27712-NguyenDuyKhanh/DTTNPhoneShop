package com.phonestore.service;

import com.phonestore.dto.VoucherDTO;
import com.phonestore.entity.*;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUserRepository voucherUserRepository;
    private final UserRepository userRepository;

    // =========================
    // ADMIN - CREATE
    // =========================
    public Voucher create(VoucherDTO dto){

        Voucher v = new Voucher();

        v.setCode(dto.getCode());
        v.setDiscount(dto.getDiscount());
        v.setPercent(dto.isPercent());
        v.setMinOrderValue(dto.getMinOrderValue());
        v.setMaxDiscount(dto.getMaxDiscount());
        v.setQuantity(dto.getQuantity());
        v.setUsed(0);

        v.setStartDate(dto.getStartDate());
        v.setEndDate(dto.getEndDate());

        v.setActive(true);

        return voucherRepository.save(v);
    }

    // =========================
    // ADMIN - GET ALL
    // =========================
    public List<Voucher> getAll(){
        return voucherRepository.findAll();
    }

    // =========================
    // USER - CLAIM
    // =========================
    public void claim(String email, Long voucherId){

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Voucher v = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if(!v.isActive())
            throw new RuntimeException("Voucher không hoạt động");

        if(v.getUsed() >= v.getQuantity())
            throw new RuntimeException("Voucher đã hết");

        if(voucherUserRepository.existsByUserAndVoucher(user, v))
            throw new RuntimeException("Bạn đã nhận voucher này");

        VoucherUser vu = new VoucherUser();
        vu.setUser(user);
        vu.setVoucher(v);
        vu.setUsed(false);

        voucherUserRepository.save(vu);
    }

    // =========================
    // USER - APPLY
    // =========================
    public double apply(String email, String code, double total){

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Voucher v = voucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));

        VoucherUser vu = voucherUserRepository
                .findByUserAndVoucher(user, v)
                .orElseThrow(() -> new RuntimeException("Bạn chưa nhận voucher"));

        if(vu.isUsed())
            throw new RuntimeException("Voucher đã sử dụng");

        if(!v.isActive())
            throw new RuntimeException("Voucher bị khóa");

        if(LocalDateTime.now().isBefore(v.getStartDate()))
            throw new RuntimeException("Chưa tới thời gian sử dụng");

        if(LocalDateTime.now().isAfter(v.getEndDate()))
            throw new RuntimeException("Voucher đã hết hạn");

        if(total < v.getMinOrderValue())
            throw new RuntimeException("Chưa đủ giá trị đơn");

        if(v.getUsed() >= v.getQuantity())
            throw new RuntimeException("Voucher đã hết");

        double discount;

        if(v.isPercent()){
            discount = total * v.getDiscount() / 100;

            if(discount > v.getMaxDiscount()){
                discount = v.getMaxDiscount();
            }
        } else {
            discount = v.getDiscount();
        }

        return discount;
    }

    // =========================
    // MARK USED (CHECKOUT)
    // =========================
    public void markUsed(String email, String code){

        User user = userRepository.findByEmail(email).orElseThrow();

        Voucher v = voucherRepository.findByCode(code).orElseThrow();

        VoucherUser vu = voucherUserRepository
                .findByUserAndVoucher(user, v)
                .orElseThrow();

        vu.setUsed(true);
        voucherUserRepository.save(vu);

        v.setUsed(v.getUsed() + 1);
        voucherRepository.save(v);
    }

    public void delete(Long id){
        voucherRepository.deleteById(id);
    }

    public Voucher update(Long id, VoucherDTO dto){

        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        v.setCode(dto.getCode());
        v.setDiscount(dto.getDiscount());
        v.setPercent(dto.isPercent());
        v.setMinOrderValue(dto.getMinOrderValue());
        v.setMaxDiscount(dto.getMaxDiscount());
        v.setQuantity(dto.getQuantity());
        v.setStartDate(dto.getStartDate());
        v.setEndDate(dto.getEndDate());

        // 🔥 bật/tắt
        v.setActive(dto.isActive());

        return voucherRepository.save(v);
    }
}