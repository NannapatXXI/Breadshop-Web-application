package com.breadShop.XXI.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.breadShop.XXI.dto.promotion.PromotionRequest;
import com.breadShop.XXI.dto.promotion.PromotionResponse;
import com.breadShop.XXI.dto.promotion.PromotionValidateResponse;
import com.breadShop.XXI.entity.Promotion;
import com.breadShop.XXI.entity.Promotion.DiscountType;
import com.breadShop.XXI.repository.PromotionRepository;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    // ดึงทั้งหมด
    public List<PromotionResponse> getAll() {
        return promotionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // สร้างโปรโมชั่น
    public PromotionResponse create(PromotionRequest request) {
        if (promotionRepository.findByCode(request.getCode()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Promotion code already exists");
        }

        Promotion promotion = new Promotion(
                request.getCode(),
                request.getName(),
                request.getDiscountType(),
                request.getDiscountValue(),
                request.getStartedAt(),
                request.getExpiredAt()
        );
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setUsageLimit(request.getUsageLimit());

        return toResponse(promotionRepository.save(promotion));
    }

    // ตรวจโค้ดก่อนสั่งซื้อ
    public PromotionValidateResponse validate(String code, BigDecimal orderAmount) {

        Promotion promotion = promotionRepository
                .findByCodeAndIsActiveTrueAndExpiredAtAfter(code, LocalDateTime.now())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Promotion code invalid or expired"));

        // เช็คยอดขั้นต่ำ
        if (promotion.getMinOrderAmount() != null &&
                orderAmount.compareTo(promotion.getMinOrderAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order amount is below minimum: " + promotion.getMinOrderAmount());
        }

        // เช็ค usage limit
        if (promotion.getUsageLimit() != null &&
                promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Promotion code has reached usage limit");
        }

        BigDecimal discount = calculateDiscount(promotion, orderAmount);

        return new PromotionValidateResponse(
                promotion.getCode(),
                promotion.getName(),
                discount
        );
    }

    // คำนวณส่วนลด (ใช้ตอนสร้าง order)
    public BigDecimal calculateDiscount(Promotion promotion, BigDecimal orderAmount) {
        BigDecimal discount;

        if (promotion.getDiscountType() == DiscountType.FIXED) {
            discount = promotion.getDiscountValue();
        } else {
            // PERCENT
            discount = orderAmount
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // ไม่เกิน maxDiscount
            if (promotion.getMaxDiscount() != null &&
                    discount.compareTo(promotion.getMaxDiscount()) > 0) {
                discount = promotion.getMaxDiscount();
            }
        }
        return discount;
    }

    // เพิ่ม usedCount (เรียกตอน order สำเร็จ)
    @Transactional
    public void incrementUsedCount(Integer promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Promotion not found"));
        promotion.setUsedCount(promotion.getUsedCount() + 1);
        promotionRepository.save(promotion);
    }

    private PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(
                p.getId(), p.getCode(), p.getName(),
                p.getDiscountType(), p.getDiscountValue(),
                p.getMinOrderAmount(), p.getMaxDiscount(),
                p.getUsageLimit(), p.getUsedCount(),
                p.getStartedAt(), p.getExpiredAt(), p.getIsActive()
        );
    }
}