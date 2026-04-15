package com.phonestore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ProductDTO {

    private Long id;

    private String name;

    private String sku;

    private String os;

    private String description;

    private Long categoryId;

    private SpecificationDTO specification;

    private List<VariantDTO> variants;

    private Double price;
    private String image;
}