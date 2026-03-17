package com.phonestore.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class VariantDTO {

    private Long id;

    private String color;

    private Double price;

    private Double salePrice;

    private LocalDateTime saleStart;
    private LocalDateTime saleEnd;

    private Integer stock;

    private List<ImageDTO> images;

}