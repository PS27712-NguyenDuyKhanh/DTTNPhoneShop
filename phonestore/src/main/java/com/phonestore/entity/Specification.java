package com.phonestore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Specification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cpu;

    private String ram;

    private String rom;

    private String gpu;

    private String battery;

    private String camera;

    private String screen;

    // FK product
    @OneToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;
}