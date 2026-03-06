package com.breadShop.XXI.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.breadShop.XXI.dto.product.ProductRequest;
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

   
   public Product createProduct(ProductRequest request) throws IOException {

    MultipartFile image = request.getImage();

    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
    File destinationFile = new File(UPLOAD_DIR, fileName);
    image.transferTo(destinationFile);

    Product product = new Product();
    product.setName(request.getName());
    product.setPrice(request.getPrice());
    product.setStock(request.getStock());
    product.setDescription(request.getDescription());
    product.setCategory(request.getCategory());
    product.setExpiryDate(request.getExpiryDate());
    product.setImageUrl("uploads/" + fileName);

    return productRepository.save(product);
}

    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public void deleteProduct(Long id) throws IOException {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getImageUrl() != null) {
            Path filePath = Paths.get(System.getProperty("user.dir"))
                                .resolve(product.getImageUrl());

            Files.deleteIfExists(filePath);
        }

        productRepository.delete(product);
    }
   /**
    * นับจำนวนสินค้าตามหมวดหมู่ที่กำหนด
    * @param category ประเภทของสินค้าที่ต้องการนับ
    * @return  จำนวนสินค้าที่อยู่ในหมวดหมู่ที่กำหนด
    */
    public Long countProductCategory(ProductCategory  category) {
        Long count = productRepository.countByCategory(category);
        System.out.println("Total products: " + count);
        return  count;
       
    }
    
    public Long countAllProducts() {
        Long count = productRepository.count();
        System.out.println("Total products: " + count);
        return  count;
       
    }
    public Long countProductsByExpiryDate() {
        Long count = productRepository.countByExpiryDateBefore(java.time.LocalDate.now());
        System.out.println("Total expired products: " + count);
        return  count;
       
    }
    public Long countProductsByStock() {
        Long count = productRepository.countByStockGreaterThan(5);
        System.out.println("Total low stock products: " + count);
        return  count;
       
    }
}
