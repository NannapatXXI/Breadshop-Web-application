package com.breadShop.XXI.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.breadShop.XXI.entity.Product;
import com.breadShop.XXI.entity.ProductCategory;
import com.breadShop.XXI.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    private static final String UPLOAD_DIR =
    System.getProperty("user.dir") + File.separator + "uploads";


   
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

   
    public Product createProduct(
        String name,
        Double price,
        Integer stock,
        String description,
        ProductCategory category,
        LocalDate expiryDate,
        MultipartFile image
) throws IOException {

    // สร้าง folder ถ้ายังไม่มี
    File uploadFolder = new File(UPLOAD_DIR);
    if (!uploadFolder.exists()) {
        uploadFolder.mkdirs();
    }

    // ตั้งชื่อไฟล์ใหม่กันชื่อซ้ำ
    String originalFilename = image.getOriginalFilename();
    String fileName = UUID.randomUUID() + "_" + originalFilename;

    File destinationFile = new File(uploadFolder, fileName);

    // บันทึกไฟล์
    image.transferTo(destinationFile);

    // สร้าง Entity
    Product product = new Product();
    product.setName(name);
    product.setPrice(price);
    product.setStock(stock);
    product.setDescription(description);
    product.setCategory(category);
    product.setExpiryDate(expiryDate);
    product.setImageUrl("uploads/" + fileName); // เก็บแค่ path relative

    return productRepository.save(product);
}


    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
