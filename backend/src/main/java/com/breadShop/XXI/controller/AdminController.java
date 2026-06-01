package com.breadShop.XXI.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.breadShop.XXI.dto.ApiResponse;
import com.breadShop.XXI.dto.order.OrderResponse;
import com.breadShop.XXI.dto.product.ProductRequest;
import com.breadShop.XXI.dto.product.ProductResponse;
import com.breadShop.XXI.entity.Order.OrderStatus;
import com.breadShop.XXI.entity.Product;
import com.breadShop.XXI.mapper.ProductMapper;
import com.breadShop.XXI.service.OrderService;
import com.breadShop.XXI.service.ProductService;

/**
 * [Claude] AdminController — endpoints ที่เฉพาะ ADMIN เท่านั้นเข้าได้
 * path: /api/v1/admin/**
 * security: ถูกล็อกด้วย SecurityConfig (ROLE_ADMIN)
 *
 * ทุก endpoint คืน ApiResponse<T> เพื่อให้ format ตรงกับ standard ของโปรเจกต์
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ProductService productService;
    private final OrderService   orderService;

    public AdminController(ProductService productService, OrderService orderService) {
        this.productService = productService;
        this.orderService   = orderService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PRODUCTS
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /api/v1/admin/add-products
     * เพิ่มสินค้าใหม่ — รับ multipart/form-data (รองรับ upload รูปภาพ)
     * คืน ProductResponse แทน Product entity เพื่อไม่ expose field ภายใน
     */
    @PostMapping(value = "/add-products", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @ModelAttribute ProductRequest request) throws IOException {

        Product product = productService.createProduct(request);
        // [Claude] แปลง entity → DTO ก่อนคืน (ตาม CLAUDE.md: Use DTO for Response)
        return ResponseEntity.ok(ApiResponse.ok("เพิ่มสินค้าสำเร็จ", ProductMapper.toResponse(product)));
    }

    /**
     * GET /api/v1/admin/products
     * ดึงสินค้าทั้งหมด — เฉพาะ admin (ถ้า user ปกติใช้ /api/v1/products แทน)
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> responses = productService.getAllProducts().stream()
                .map(ProductMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    /**
     * GET /api/v1/admin/get-product-by-id/{id}
     * ดึงสินค้าตาม ID สำหรับหน้า edit product
     */
    @GetMapping("/get-product-by-id/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(ProductMapper.toResponse(product)));
    }

    /**
     * PUT /api/v1/admin/products/{id}
     * แก้ไขสินค้า — รับ multipart/form-data (อัปโหลดรูปใหม่ได้)
     * ถ้าไม่ส่ง image field มาจะใช้รูปเดิม
     */
    @PutMapping(value = "/products/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequest request) throws IOException {

        Product product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.ok("แก้ไขสินค้าสำเร็จ", ProductMapper.toResponse(product)));
    }

    /**
     * DELETE /api/v1/admin/{id}
     * ลบสินค้า — ลบรูปภาพออกจาก disk ด้วย (ดูใน ProductService.deleteProduct)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("ลบสินค้าสำเร็จ"));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ORDERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/admin/orders
     * ดึง order ทั้งหมดในระบบ
     */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAll()));
    }

    /**
     * PATCH /api/v1/admin/{id}/status?status=SHIPPED&trackingNo=TH123456
     * อัปเดตสถานะ order และ tracking number
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Integer id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String trackingNo) {

        return ResponseEntity.ok(
                ApiResponse.ok("อัปเดตสถานะสำเร็จ", orderService.updateStatus(id, status, trackingNo)));
    }
}
