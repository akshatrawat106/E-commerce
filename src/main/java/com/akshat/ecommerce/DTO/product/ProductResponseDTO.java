package com.akshat.ecommerce.DTO.product;

import com.akshat.ecommerce.DTO.category.CategoryResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductResponseDTO {

    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private String shortDesc;
    private BigDecimal price;
    private BigDecimal comparePrice;
    private Integer quantity;
    private String imageUrl;
    private BigDecimal weight;
    private Boolean isActive;
    private Boolean isFeatured;
    private LocalDateTime createdAt;

    // Nested objects
    private CategoryResponseDTO category;
    private List<ProductImageDTO> galleryImages;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getShortDesc() { return shortDesc; }
    public void setShortDesc(String shortDesc) { this.shortDesc = shortDesc; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getComparePrice() { return comparePrice; }
    public void setComparePrice(BigDecimal comparePrice) { this.comparePrice = comparePrice; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public CategoryResponseDTO getCategory() { return category; }
    public void setCategory(CategoryResponseDTO category) { this.category = category; }

    public List<ProductImageDTO> getGalleryImages() { return galleryImages; }
    public void setGalleryImages(List<ProductImageDTO> galleryImages) { this.galleryImages = galleryImages; }
}