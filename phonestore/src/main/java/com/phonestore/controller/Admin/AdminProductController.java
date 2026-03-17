package com.phonestore.controller.Admin;

import com.phonestore.dto.CreateProductRequest;
import com.phonestore.dto.ProductDTO;
import com.phonestore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    // =========================
    // CREATE
    // =========================
    @PostMapping
    public ProductDTO create(@RequestBody CreateProductRequest request) {
        return productService.createProduct(request);
    }

    // =========================
    // UPDATE
    // =========================
    @PutMapping("/{id}")
    public ProductDTO update(@PathVariable Long id,
                             @RequestBody CreateProductRequest request) {

        return productService.updateProduct(id, request);
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    // =========================
    // GET ALL (ADMIN)
    // =========================
    @GetMapping("/all")
    public List<ProductDTO> getAll() {
        return productService.getAllProducts();
    }

    // =========================
    // PAGINATION
    // =========================
    @GetMapping
    public Page<ProductDTO> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return productService.getProducts(page, size);
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public ProductDTO getById(@PathVariable Long id) {
        return productService.getProduct(id);
    }
}