package com.phonestore.repository;

import com.phonestore.entity.User;
import com.phonestore.entity.Voucher;
import com.phonestore.entity.VoucherUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VoucherUserRepository extends JpaRepository<VoucherUser, Long> {

    boolean existsByUserAndVoucher(User user, Voucher voucher);

    Optional<VoucherUser> findByUserAndVoucher(User user, Voucher voucher);
}