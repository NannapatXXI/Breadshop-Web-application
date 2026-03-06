package com.breadShop.XXI.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.breadShop.XXI.entity.ProductCategory;
import com.breadShop.XXI.repository.UserRepository;
import com.breadShop.XXI.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    
    private final UserRepository userRepository;
    private final ProductService productService;

    public ProductController(UserRepository userRepository, ProductService productService) {
        this.userRepository = userRepository;
        this.productService = productService;

    }

    // ---------- Get Count Product ---------- Test Pass 
    @GetMapping("/get-count-Category")
    public ResponseEntity<?> me( @RequestParam String categoryString) {
            ProductCategory category = ProductCategory.valueOf(categoryString.toUpperCase());
            Long count = productService.countProductCategory(category);
            return ResponseEntity.ok(" จำนวนสินค้าประเภท " + categoryString + " มีทั้งหมด " + count + " ชิ้น");
    }

    // ---------- Get Count Stock Greater Than ----------
    @GetMapping("/get-count-stock")
    public ResponseEntity<?> getCountStockGreaterThan(@RequestParam int stock) {
        Long count = productService.countStockGreaterThan(stock);
        return ResponseEntity.ok(" จำนวนสินค้าที่มีสต็อกมากกว่า " + stock + " มีทั้งหมด " + count + " ชิ้น");
    }

}
