package com.breadShop.XXI.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.breadShop.XXI.dto.order.OrderRequest;
import com.breadShop.XXI.dto.order.OrderResponse;
import com.breadShop.XXI.dto.orderline.OrderLineResponse;
import com.breadShop.XXI.entity.Order;
import com.breadShop.XXI.entity.Order.OrderStatus;
import com.breadShop.XXI.entity.OrderLine;
import com.breadShop.XXI.entity.Product;
import com.breadShop.XXI.entity.Promotion;
import com.breadShop.XXI.entity.User;
import com.breadShop.XXI.entity.UserAddress;
import com.breadShop.XXI.repository.OrderRepository;
import com.breadShop.XXI.repository.ProductRepository;
import com.breadShop.XXI.repository.PromotionRepository;
import com.breadShop.XXI.repository.UserAddressRepository;
import com.breadShop.XXI.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;
    private final PromotionService promotionService;

    public OrderService(OrderRepository orderRepository,
                        UserRepository userRepository,
                        UserAddressRepository userAddressRepository,
                        ProductRepository productRepository,
                        PromotionRepository promotionRepository,
                        PromotionService promotionService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.userAddressRepository = userAddressRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
        this.promotionService = promotionService;
    }

    // ดึง order ทั้งหมดของ user
    public List<OrderResponse> getByUserId(Integer userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ดึง order เดี่ยว
    public OrderResponse getById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order);
    }

    // สร้าง order
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        // 1. ดึง user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        // 2. ดึงที่อยู่ที่เลือก
        UserAddress address = userAddressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Address not found"));

        // 3. สร้าง order + snapshot ที่อยู่
        Order order = new Order(user, generateOrderNo(), address);
        order.setShippingFee(request.getShippingFee() != null
                ? request.getShippingFee() : BigDecimal.ZERO);
        order.setNote(request.getNote());

        // 4. สร้าง order lines + คำนวณ subtotal
        BigDecimal subtotal = BigDecimal.ZERO;

        for (var item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId().longValue())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Product not found: " + item.getProductId()));

            // เช็ค stock
            if (product.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Insufficient stock for: " + product.getName());
            }

            BigDecimal discount = item.getDiscountAmount() != null
                    ? item.getDiscountAmount() : BigDecimal.ZERO;

            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .subtract(discount);

            OrderLine line = new OrderLine(
                    order,
                    product,
                    product.getName(),        // snapshot
                    product.getPrice(),       // snapshot
                    item.getQuantity(),
                    lineTotal
            );
            line.setDiscountAmount(discount);
            order.getOrderLines().add(line);

            subtotal = subtotal.add(lineTotal);

            // ลด stock
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        order.setSubtotal(subtotal);

        // 5. คำนวณส่วนลดโปรโมชั่น
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            Promotion promotion = promotionRepository
                    .findByCodeAndIsActiveTrueAndExpiredAtAfter(
                            request.getPromotionCode(), LocalDateTime.now())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Invalid promotion code"));

            discountAmount = promotionService.calculateDiscount(promotion, subtotal);
            order.setPromotion(promotion);
            order.setPromotionCode(promotion.getCode());
            promotionService.incrementUsedCount(promotion.getId());
        }

        order.setDiscountAmount(discountAmount);

        // 6. คำนวณ total
        BigDecimal total = subtotal
                .subtract(discountAmount)
                .add(order.getShippingFee());
        order.setTotalAmount(total);

        return toResponse(orderRepository.save(order));
    }

    // อัปเดตสถานะ
    @Transactional
    public OrderResponse updateStatus(Integer id, OrderStatus status, String trackingNo) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        if (trackingNo != null) order.setTrackingNo(trackingNo);
        return toResponse(orderRepository.save(order));
    }

    // generate order number
    private String generateOrderNo() {
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "ORD-" + timestamp;
    }

    private OrderLineResponse toLineResponse(OrderLine ol) {
        return new OrderLineResponse(
                ol.getId(),
                ol.getProduct().getId().intValue(),
                ol.getProductName(),
                ol.getProductSku(),
                ol.getUnitPrice(),
                ol.getQuantity(),
                ol.getDiscountAmount(),
                ol.getTotalPrice()
        );
    }

    private OrderResponse toResponse(Order o) {
        List<OrderLineResponse> lines = o.getOrderLines()
                .stream()
                .map(this::toLineResponse)
                .collect(Collectors.toList());

        return new OrderResponse(
                o.getId(), o.getOrderNo(),
                o.getUser().getId(),
                o.getShippingName(), o.getShippingPhone(),
                o.getShippingAddress(), o.getShippingProvince(),
                o.getShippingDistrict(), o.getShippingSubdistrict(),
                o.getShippingPostcode(),
                o.getSubtotal(), o.getDiscountAmount(),
                o.getShippingFee(), o.getTotalAmount(),
                o.getPromotionCode(), o.getStatus(),
                o.getTrackingNo(), o.getNote(),
                lines, o.getCreatedAt()
        );
    }


    // ดึง order ทั้งหมด (admin)
    public List<OrderResponse> getAll() {
        return orderRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}