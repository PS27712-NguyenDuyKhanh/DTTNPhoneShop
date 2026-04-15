package com.phonestore.repository;

import com.phonestore.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByCategoryIdIn(List<Long> categoryIds, Pageable pageable);

    @Query("""
    SELECT c.name, COUNT(p)
    FROM Product p
    JOIN Category c ON p.categoryId = c.id
    GROUP BY c.name
""")
    List<Object[]> countByCategory();
}