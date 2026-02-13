package com.breadShop.XXI.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.breadShop.XXI.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
