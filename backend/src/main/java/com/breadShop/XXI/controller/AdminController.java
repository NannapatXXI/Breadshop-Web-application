package com.breadShop.XXI.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.breadShop.XXI.dto.product.ProductResponse;
import com.breadShop.XXI.entity.Product;
import com.breadShop.XXI.entity.ProductCategory;
import com.breadShop.XXI.mapper.ProductMapper;
import com.breadShop.XXI.service.ProductService;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ProductService productService;

   
    public AdminController(ProductService productService) {
        this.productService = productService;
    }

   
    @PostMapping(value = "/Add-products" ,consumes = "multipart/form-data")
    public ResponseEntity<Product> createProduct(
            @RequestParam String name,
            @RequestParam Double price,
            @RequestParam Integer stock,
            @RequestParam String description,
            @RequestParam ProductCategory category,
            @RequestParam String expiryDate,
            @RequestParam MultipartFile image
    ) throws IOException {

        Product product = productService.createProduct(
                name,
                price,
                stock,
                description,
                category,
                LocalDate.parse(expiryDate),
                image
        );

        return ResponseEntity.ok(product);
    }

    // ==============================
    // 📦 GET ALL PRODUCTS
    // ==============================
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        List<Product> products = productService.getAllProducts();

        List<ProductResponse> responses = products.stream()
                .map(ProductMapper::toResponse)
                .toList();

        return ResponseEntity.ok(responses);
    }
}
