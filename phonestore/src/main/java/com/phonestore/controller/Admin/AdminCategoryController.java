package com.phonestore.controller.Admin;

import com.phonestore.dto.CategoryDTO;
import com.phonestore.dto.CreateCategoryRequest;
import com.phonestore.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public Page<CategoryDTO> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return categoryService.getAll(page, size);
    }

    @PostMapping
    public CategoryDTO create(@RequestBody CreateCategoryRequest request){
        return categoryService.create(request);
    }

    @PutMapping("/{id}")
    public CategoryDTO update(@PathVariable Long id,
                              @RequestBody CreateCategoryRequest request){
        return categoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        categoryService.delete(id);
    }
}