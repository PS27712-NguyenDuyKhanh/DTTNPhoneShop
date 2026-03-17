package com.phonestore.repository;

import com.phonestore.entity.Variant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VariantRepository extends JpaRepository<Variant, Long> {
    void deleteByProductId(Long productId);

}