package com.phonestore.mapper;

import com.phonestore.dto.*;
import com.phonestore.entity.*;

import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductDTO toDTO(Product product) {

        ProductDTO dto = new ProductDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSku(product.getSku());
        dto.setOs(product.getOs());
        dto.setDescription(product.getDescription());
        dto.setCategoryId(product.getCategoryId());

        // specification
        if (product.getSpecification() != null) {

            Specification spec = product.getSpecification();

            SpecificationDTO specDTO = new SpecificationDTO();

            specDTO.setCpu(spec.getCpu());
            specDTO.setRam(spec.getRam());
            specDTO.setRom(spec.getRom());
            specDTO.setGpu(spec.getGpu());
            specDTO.setBattery(spec.getBattery());
            specDTO.setCamera(spec.getCamera());
            specDTO.setScreen(spec.getScreen());

            dto.setSpecification(specDTO);
        }

        // variants
        if (product.getVariants() != null) {

            List<VariantDTO> variants = product.getVariants()
                    .stream()
                    .map(ProductMapper::toVariantDTO)
                    .collect(Collectors.toList());

            dto.setVariants(variants);
        }

        return dto;
    }

    private static VariantDTO toVariantDTO(Variant variant) {

        VariantDTO dto = new VariantDTO();

        dto.setId(variant.getId());
        dto.setColor(variant.getColor());
        dto.setPrice(variant.getPrice());
        dto.setSalePrice(variant.getSalePrice());
        dto.setStock(variant.getStock());
        dto.setSaleStart(variant.getSaleStart());
        dto.setSaleEnd(variant.getSaleEnd());

        if (variant.getImages() != null) {

            List<ImageDTO> images = variant.getImages()
                    .stream()
                    .map(img -> {

                        ImageDTO imageDTO = new ImageDTO();
                        imageDTO.setImageUrl(img.getImageUrl());

                        return imageDTO;

                    }).collect(Collectors.toList());

            dto.setImages(images);
        }

        return dto;
    }
}