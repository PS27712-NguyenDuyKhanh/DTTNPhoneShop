package com.phonestore.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    private Long id;
    private String name;

    // chỉ lấy thông tin cha cơ bản (tránh loop)
    private Long parentId;
    private String parentName;

    // danh sách con (nếu cần)
    private List<CategoryDTO> children;
}