package com.akshat.ecommerce.Service;

import com.akshat.ecommerce.DTO.*;
import com.akshat.ecommerce.DTO.category.CategoryResponseDTO;
import com.akshat.ecommerce.DTO.common.PageResponseDTO;
import com.akshat.ecommerce.DTO.product.ProductImageDTO;
import com.akshat.ecommerce.DTO.product.ProductRequestDTO;
import com.akshat.ecommerce.DTO.product.ProductResponseDTO;
import com.akshat.ecommerce.Entity.Category;
import com.akshat.ecommerce.Entity.Product;
import com.akshat.ecommerce.Repository.CategoryRepository;
import com.akshat.ecommerce.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        Product product = new Product();
        mapRequestToEntity(request, product);

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ProductResponseDTO> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);

        return mapToPageResponse(productPage);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        mapRequestToEntity(request, product);

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private void mapRequestToEntity(ProductRequestDTO request, Product product) {
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setShortDesc(request.getShortDesc());
        product.setPrice(request.getPrice());
        product.setComparePrice(request.getComparePrice());
        product.setCostPrice(request.getCostPrice());
        product.setQuantity(request.getQuantity());
        product.setImageUrl(request.getImageUrl());
        product.setWeight(request.getWeight());
        product.setIsActive(request.getIsActive());
        product.setIsFeatured(request.getIsFeatured());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
    }

    private ProductResponseDTO mapToResponse(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setSku(product.getSku());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setShortDesc(product.getShortDesc());
        dto.setPrice(product.getPrice());
        dto.setComparePrice(product.getComparePrice());
        dto.setQuantity(product.getQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setWeight(product.getWeight());
        dto.setIsActive(product.getIsActive());
        dto.setIsFeatured(product.getIsFeatured());
        dto.setCreatedAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            CategoryResponseDTO catDto = new CategoryResponseDTO();
            catDto.setId(product.getCategory().getId());
            catDto.setName(product.getCategory().getName());
            catDto.setSlug(product.getCategory().getSlug());
            dto.setCategory(catDto);
        }

        if (product.getGalleryImages() != null) {
            dto.setGalleryImages(product.getGalleryImages().stream()
                    .map(img -> {
                        ProductImageDTO imgDto = new ProductImageDTO();
                        imgDto.setId(img.getId());
                        imgDto.setImageUrl(img.getImageUrl());
                        imgDto.setAltText(img.getAltText());
                        imgDto.setSortOrder(img.getSortOrder());
                        imgDto.setIsPrimary(img.getIsPrimary());
                        return imgDto;
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private PageResponseDTO<ProductResponseDTO> mapToPageResponse(Page<Product> page) {
        PageResponseDTO<ProductResponseDTO> response = new PageResponseDTO<>();
        response.setContent(page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
}