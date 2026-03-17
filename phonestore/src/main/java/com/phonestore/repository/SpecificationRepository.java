package com.phonestore.repository;

import com.phonestore.entity.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpecificationRepository extends JpaRepository<Specification, Long> {
    void deleteByProductId(Long productId);
    Optional<Specification> findByProductId(Long productId);
}
