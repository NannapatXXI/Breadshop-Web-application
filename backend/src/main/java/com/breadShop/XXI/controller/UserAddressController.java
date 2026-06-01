package com.breadShop.XXI.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.breadShop.XXI.dto.ApiResponse;
import com.breadShop.XXI.dto.useraddress.UserAddressRequest;
import com.breadShop.XXI.dto.useraddress.UserAddressResponse;
import com.breadShop.XXI.service.UserAddressService;

/**
 * [Claude] UserAddressController — CRUD ที่อยู่จัดส่งของ user
 * path: /api/users/{userId}/addresses/**
 *
 * user แต่ละคนมีหลายที่อยู่ได้ แต่ isDefault ได้แค่อันเดียว
 * เมื่อ setDefault(addressId) → service จะ unset ของเก่าก่อน แล้ว set อันใหม่
 */
@RestController
@RequestMapping("/api/users/{userId}/addresses")
public class UserAddressController {

    private final UserAddressService userAddressService;

    public UserAddressController(UserAddressService userAddressService) {
        this.userAddressService = userAddressService;
    }

    /**
     * GET /api/users/1/addresses
     * ดึงที่อยู่ทั้งหมดของ user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAddressResponse>>> getAll(@PathVariable Integer userId) {
        return ResponseEntity.ok(ApiResponse.ok(userAddressService.getAddressesByUserId(userId)));
    }

    /**
     * POST /api/users/1/addresses
     * เพิ่มที่อยู่ใหม่ — ถ้า isDefault=true จะ unset ที่อยู่ default เก่าด้วย
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserAddressResponse>> create(
            @PathVariable Integer userId,
            @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("เพิ่มที่อยู่สำเร็จ",
                userAddressService.createAddress(userId, request)));
    }

    /**
     * PUT /api/users/1/addresses/2
     * แก้ไขที่อยู่
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<UserAddressResponse>> update(
            @PathVariable Integer userId,
            @PathVariable Integer addressId,
            @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("แก้ไขที่อยู่สำเร็จ",
                userAddressService.updateAddress(addressId, request)));
    }

    /**
     * DELETE /api/users/1/addresses/2
     * ลบที่อยู่ — ถ้าลบ default อยู่ frontend ควร refresh list
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer userId,
            @PathVariable Integer addressId) {
        userAddressService.deleteAddress(addressId);
        return ResponseEntity.ok(ApiResponse.ok("ลบที่อยู่สำเร็จ"));
    }

    /**
     * PUT /api/users/1/addresses/2/default
     * ตั้งที่อยู่นี้เป็น default — service จะ unset อันเก่าให้อัตโนมัติ
     */
    @PutMapping("/{addressId}/default")
    public ResponseEntity<ApiResponse<UserAddressResponse>> setDefault(
            @PathVariable Integer userId,
            @PathVariable Integer addressId) {
        return ResponseEntity.ok(ApiResponse.ok("ตั้ง default สำเร็จ",
                userAddressService.setDefault(userId, addressId)));
    }
}
