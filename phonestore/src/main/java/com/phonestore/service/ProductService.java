package com.phonestore.service;

import com.phonestore.dto.CreateProductRequest;
import com.phonestore.dto.ImageDTO;
import com.phonestore.dto.ProductDTO;
import com.phonestore.dto.VariantDTO;
import com.phonestore.entity.*;
import com.phonestore.mapper.ProductMapper;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SpecificationRepository specificationRepository;
    private final VariantRepository variantRepository;
    private final ImageRepository imageRepository;
    private final CategoryRepository categoryRepository;

    // =========================
    // CREATE
    // =========================
    @Transactional
    public ProductDTO createProduct(CreateProductRequest request) {

        Product product = new Product();

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setOs(request.getOs());
        product.setDescription(request.getDescription());
        product.setCategoryId(request.getCategoryId());
        product.setCreatedAt(LocalDateTime.now());

        productRepository.save(product);

        saveSpecification(request, product);
        saveVariants(request, product);

        return ProductMapper.toDTO(product);
    }

    // =========================
    // UPDATE
    // =========================
    @Transactional
    public ProductDTO updateProduct(Long id, CreateProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setOs(request.getOs());
        product.setDescription(request.getDescription());
        product.setCategoryId(request.getCategoryId());

        productRepository.save(product);

    /* ======================
       UPDATE SPECIFICATION
    ====================== */

        Specification spec = specificationRepository
                .findByProductId(id)
                .orElse(new Specification());

        spec.setCpu(request.getSpecification().getCpu());
        spec.setRam(request.getSpecification().getRam());
        spec.setRom(request.getSpecification().getRom());
        spec.setGpu(request.getSpecification().getGpu());
        spec.setBattery(request.getSpecification().getBattery());
        spec.setCamera(request.getSpecification().getCamera());
        spec.setScreen(request.getSpecification().getScreen());

        spec.setProduct(product);

        specificationRepository.save(spec);

    /* ======================
       UPDATE VARIANTS
    ====================== */

        updateVariants(request, product);

        return ProductMapper.toDTO(product);
    }

    // =========================
    // DELETE
    // =========================
    @Transactional
    public void deleteProduct(Long id) {

        variantRepository.deleteByProductId(id);
        specificationRepository.deleteByProductId(id);

        productRepository.deleteById(id);
    }

    // =========================
    // GET ALL
    // =========================
    public List<ProductDTO> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    // =========================
    // PAGINATION
    // =========================
    public Page<ProductDTO> getProductsByCategory(Long categoryId, int page, int size){

        Pageable pageable = PageRequest.of(page, size);

        List<Long> categoryIds = new ArrayList<>();

        categoryIds.add(categoryId);

        // tìm category con
        List<Category> children = categoryRepository.findByParentId(categoryId);

        for(Category c : children){
            categoryIds.add(c.getId());
        }

        return productRepository
                .findByCategoryIdIn(categoryIds, pageable)
                .map(ProductMapper::toDTO);
    }

    // =========================
    // GET BY ID
    // =========================
    public ProductDTO getProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return ProductMapper.toDTO(product);
    }

    // =========================
// PAGINATION (ADMIN)
// =========================
    public Page<ProductDTO> getProducts(int page, int size){

        Pageable pageable = PageRequest.of(page, size);

        return productRepository
                .findAll(pageable)
                .map(ProductMapper::toDTO);
    }

    private void saveSpecification(CreateProductRequest request, Product product) {

        if (request.getSpecification() == null) return;

        Specification spec = new Specification();

        spec.setCpu(request.getSpecification().getCpu());
        spec.setRam(request.getSpecification().getRam());
        spec.setRom(request.getSpecification().getRom());
        spec.setGpu(request.getSpecification().getGpu());
        spec.setBattery(request.getSpecification().getBattery());
        spec.setCamera(request.getSpecification().getCamera());
        spec.setScreen(request.getSpecification().getScreen());

        spec.setProduct(product);

        specificationRepository.save(spec);
    }

    /// ///////////////
    private void updateVariants(CreateProductRequest request, Product product){

        if(request.getVariants() == null) return;

        for(VariantDTO v : request.getVariants()){

            Variant variant;

            if(v.getId() != null){

                variant = variantRepository.findById(v.getId())
                        .orElse(new Variant());

            }else{
                variant = new Variant();
            }

            variant.setColor(v.getColor());
            variant.setPrice(v.getPrice());
            variant.setSalePrice(v.getSalePrice());
            variant.setStock(v.getStock());
            variant.setSaleStart(v.getSaleStart());
            variant.setSaleEnd(v.getSaleEnd());
            variant.setProduct(product);

            variantRepository.save(variant);

            if(v.getImages() != null){

                imageRepository.deleteByVariantId(variant.getId());

                for(ImageDTO img : v.getImages()){

                    Image image = new Image();
                    image.setImageUrl(img.getImageUrl());
                    image.setVariant(variant);

                    imageRepository.save(image);
                }
            }
        }
    }

    // =========================
    // SAVE VARIANTS + IMAGES
    // =========================
    private void saveVariants(CreateProductRequest request, Product product) {

        if (request.getVariants() == null) return;

        for (VariantDTO v : request.getVariants()) {

            Variant variant = new Variant();

            variant.setColor(v.getColor());
            variant.setPrice(v.getPrice());
            variant.setSalePrice(v.getSalePrice());
            variant.setStock(v.getStock());

            variant.setSaleStart(v.getSaleStart());
            variant.setSaleEnd(v.getSaleEnd());
            variant.setProduct(product);

            variantRepository.save(variant);

            if (v.getImages() != null) {

                for (ImageDTO img : v.getImages()) {

                    Image image = new Image();
                    image.setImageUrl(img.getImageUrl());
                    image.setVariant(variant);

                    imageRepository.save(image);
                }
            }
        }
    }
}