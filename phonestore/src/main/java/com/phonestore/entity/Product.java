package com.phonestore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String sku;

    private String os;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;

    @Column(name = "category_id")
    private Long categoryId;

    // 1 Product - 1 Specification
    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private Specification specification;

    // 1 Product - many Variant
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Variant> variants;
}