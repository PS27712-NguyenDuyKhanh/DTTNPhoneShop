package com.phonestore.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateProductRequest {

    private String name;

    private String sku;

    private String os;

    private String description;

    private Long categoryId;

    private SpecificationDTO specification;

    private List<VariantDTO> variants;
}