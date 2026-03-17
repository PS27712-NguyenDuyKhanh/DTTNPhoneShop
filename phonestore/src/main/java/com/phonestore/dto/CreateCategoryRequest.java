package com.phonestore.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCategoryRequest {

    private String name;

    private Long parentId;
}