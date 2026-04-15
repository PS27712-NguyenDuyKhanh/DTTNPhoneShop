package com.phonestore.repository;

import com.phonestore.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder_Id(Long orderId);

    @Query("""
    SELECT p.method, COUNT(p)
    FROM Payment p
    GROUP BY p.method
""")
    List<Object[]> countByMethod();

}