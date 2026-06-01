package com.breadShop.XXI.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.breadShop.XXI.dto.ApiResponse;
import com.breadShop.XXI.dto.orderline.OrderLineResponse;
import com.breadShop.XXI.service.OrderLineService;

/**
 * [Claude] OrderLineController — รายการสินค้าในแต่ละ order
 * path: /api/orders/{orderId}/lines/**
 *
 * OrderLine = 1 row ใน order เช่น "ขนมปัง 2 ชิ้น ราคา 100 บาท"
 * order 1 ใบมีหลาย line ได้
 */
@RestController
@RequestMapping("/api/orders/{orderId}/lines")
public class OrderLineController {

    private final OrderLineService orderLineService;

    public OrderLineController(OrderLineService orderLineService) {
        this.orderLineService = orderLineService;
    }

    /**
     * GET /api/orders/1/lines
     * ดึง line ทั้งหมดของ order นั้น
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderLineResponse>>> getAll(@PathVariable Integer orderId) {
        return ResponseEntity.ok(ApiResponse.ok(orderLineService.getByOrderId(orderId)));
    }

    /**
     * GET /api/orders/1/lines/2
     * ดึง line เดียวตาม id
     */
    @GetMapping("/{lineId}")
    public ResponseEntity<ApiResponse<OrderLineResponse>> getOne(
            @PathVariable Integer orderId,
            @PathVariable Integer lineId) {
        return ResponseEntity.ok(ApiResponse.ok(orderLineService.getById(lineId)));
    }
}
