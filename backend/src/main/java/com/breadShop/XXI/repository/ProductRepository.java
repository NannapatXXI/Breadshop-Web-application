package com.breadShop.XXI.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;

import com.breadShop.XXI.entity.Product;
import com.breadShop.XXI.entity.ProductCategory;

/**
 * เอาไว้ติดต่อกับฐานข้อมูลสำหรับ Product โดยใช้ Spring Data JPA
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    long countByCategory(ProductCategory category);//นับตามประเภท
    long countByStockGreaterThan(int stock);//นับตามจำนวนสินค้าในสต็อกที่มากกว่า 
    long countByExpiryDateBefore(LocalDate date);//นับตามวันที่หมดอายุที่น้อยกว่าที่กำหนด
}
