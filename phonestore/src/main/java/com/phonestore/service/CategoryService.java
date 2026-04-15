package com.phonestore.service;

import com.phonestore.dto.CategoryDTO;
import com.phonestore.dto.CreateCategoryRequest;
import com.phonestore.entity.Category;
import com.phonestore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // ===== mapper =====
    private CategoryDTO toDTO(Category c){
        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .build();
    }

    // ===== GET =====
    public Page<CategoryDTO> getAll(int page, int size) {
        return categoryRepository
                .findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    // ===== CREATE =====
    public CategoryDTO create(CreateCategoryRequest request) {

        String name = request.getName().trim();

        if(categoryRepository.existsByNameIgnoreCase(name)){
            throw new RuntimeException("Tên danh mục đã tồn tại!");
        }

        Category category = new Category();
        category.setName(name);

        if(request.getParentId() != null){
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        }

        return toDTO(categoryRepository.save(category));
    }

    // ===== UPDATE =====
    public CategoryDTO update(Long id, CreateCategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        String name = request.getName().trim();

        if(categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)){
            throw new RuntimeException("Tên danh mục đã tồn tại!");
        }

        category.setName(name);

        if(request.getParentId() != null){
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return toDTO(categoryRepository.save(category));
    }

    // ===== DELETE =====
    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}