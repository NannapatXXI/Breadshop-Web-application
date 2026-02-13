package com.breadShop.XXI.dto.product;

import java.time.LocalDate;

import com.breadShop.XXI.entity.ProductCategory;

public class ProductResponse {

    private Long id;
    private String name;
    private Double price;
    private Integer stock;
    private String description;
    private String imageUrl;
    private ProductCategory category;
    private LocalDate expiryDate;

    public ProductResponse(Long id, String name, Double price,
                           Integer stock, String description,
                           String imageUrl, ProductCategory category,
                           LocalDate expiryDate) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
        this.expiryDate = expiryDate;
    }

    // ===== Getter =====

    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getPrice() { return price; }
    public Integer getStock() { return stock; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public ProductCategory getCategory() { return category; }
    public LocalDate getExpiryDate() { return expiryDate; }
}
