package com.breadShop.XXI.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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



    /**
     * ค้นหาสินค้าตาม ID หากไม่พบจะโยนข้อผิดพลาด 404 Not Found
     * @param id ID ของสินค้าที่ต้องการค้นหา
     * @return ข้อมูลสินค้าในรูปแบบ Product Entity หากพบ, หรือโยนข้อผิดพลาดหากไม่พบ
     */
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not Found Product ID")); 
    }



    // [Claude] อัปเดตข้อมูลสินค้า — ถ้าส่งรูปใหม่มาด้วยจะลบรูปเก่าแล้วบันทึกรูปใหม่
    public Product updateProduct(Long id, ProductRequest request) throws IOException {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setExpiryDate(request.getExpiryDate());

        // ถ้ามีรูปใหม่ส่งมา → ลบรูปเก่า แล้ว save รูปใหม่
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            if (product.getImageUrl() != null) {
                try {
                    Files.deleteIfExists(Paths.get(System.getProperty("user.dir")).resolve(product.getImageUrl()));
                } catch (IOException e) {
                    System.out.println("Delete old image failed: " + e.getMessage());
                }
            }
            String fileName = UUID.randomUUID() + "_" + request.getImage().getOriginalFilename();
            File dest = new File(UPLOAD_DIR, fileName);
            request.getImage().transferTo(dest);
            product.setImageUrl("uploads/" + fileName);
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    
        if (product.getImageUrl() != null) {
            try {
                Path filePath = Paths.get(System.getProperty("user.dir"))
                        .resolve(product.getImageUrl());
    
                Files.deleteIfExists(filePath);
    
            } catch (IOException e) {
                System.out.println("Image delete failed: " + e.getMessage());
            }
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
    public Long countProductsByStock(int stock) {
        Long count = productRepository.countByStockGreaterThan(stock);
        System.out.println("Total low stock products: " + count);
        return  count;
       
    }

  
}
