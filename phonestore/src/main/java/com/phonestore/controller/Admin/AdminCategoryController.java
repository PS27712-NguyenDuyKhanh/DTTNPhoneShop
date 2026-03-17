package com.phonestore.controller.Admin;

import com.phonestore.dto.CreateCategoryRequest;
import com.phonestore.entity.Category;
import com.phonestore.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryRepository categoryRepository;

    public AdminCategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // lấy danh sách category
    @GetMapping
    public List<Category> getAll(){
        return categoryRepository.findAll();
    }

    // tạo category
    @PostMapping
    public Category create(@RequestBody CreateCategoryRequest request){

        Category category = new Category();

        category.setName(request.getName());

        if(request.getParentId() != null){

            Category parent = categoryRepository
                    .findById(request.getParentId())
                    .orElseThrow(() ->
                            new RuntimeException("Parent category not found"));

            category.setParent(parent);
        }

        return categoryRepository.save(category);
    }

    // update category
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id,
                           @RequestBody CreateCategoryRequest request){

        Category category = categoryRepository.findById(id)
                .orElseThrow();

        category.setName(request.getName());

        return categoryRepository.save(category);
    }

    // delete category
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){

        categoryRepository.deleteById(id);
    }

}