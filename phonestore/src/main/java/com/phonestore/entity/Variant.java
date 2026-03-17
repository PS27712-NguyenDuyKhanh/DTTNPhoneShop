package com.phonestore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Variant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String color;

    private Double price;

    private Double salePrice;

    private Integer stock;

    private LocalDateTime saleStart;

    private LocalDateTime saleEnd;

    // FK product
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    // 1 variant - many images
    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL)
    private List<Image> images;
}