package com.phonestore.mapper;

import com.phonestore.dto.CategoryDTO;
import com.phonestore.entity.Category;

import java.util.stream.Collectors;

public class CategoryMapper {

    public static CategoryDTO toDTO(Category c) {
        if (c == null) return null;

        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .children(
                        c.getChildren() != null
                                ? c.getChildren().stream()
                                .map(CategoryMapper::toDTO)
                                .collect(Collectors.toList())
                                : null
                )
                .build();
    }
}