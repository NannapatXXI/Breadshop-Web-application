// [Claude] Service รวบรวมข้อมูลสำหรับ admin dashboard ทั้งหมด
package com.breadShop.XXI.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.breadShop.XXI.dto.dashboard.CategorySalesResponse;
import com.breadShop.XXI.dto.dashboard.CategorySalesResponse.CategoryData;
import com.breadShop.XXI.dto.dashboard.DashboardSummaryResponse;
import com.breadShop.XXI.dto.dashboard.SalesChartResponse;
import com.breadShop.XXI.dto.dashboard.SalesChartResponse.DataPoint;
import com.breadShop.XXI.dto.dashboard.TopProductResponse;
import com.breadShop.XXI.entity.Order;
import com.breadShop.XXI.entity.Order.OrderStatus;
import com.breadShop.XXI.entity.OrderLine;
import com.breadShop.XXI.repository.OrderLineRepository;
import com.breadShop.XXI.repository.OrderRepository;
import com.breadShop.XXI.repository.UserRepository;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final UserRepository userRepository;

    public DashboardService(OrderRepository orderRepository,
                             OrderLineRepository orderLineRepository,
                             UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderLineRepository = orderLineRepository;
        this.userRepository = userRepository;
    }

    // [Claude] คำนวณตัวเลข summary cards ทั้งหมด
    public DashboardSummaryResponse getSummary() {
        List<Order> allOrders = orderRepository.findAll();

        LocalDate today = LocalDate.now();
        // [Claude] ใช้ 30 วันย้อนหลัง และ 30 วันก่อนหน้านั้น เพื่อ compare %
        LocalDate last30Start = today.minusDays(30);
        LocalDate prev30Start = today.minusDays(60);

        // ยอดขายวันนี้ (ไม่นับ CANCELLED/REFUNDED)
        BigDecimal todayRevenue = allOrders.stream()
                .filter(o -> !isExcluded(o.getStatus()))
                .filter(o -> o.getCreatedAt().toLocalDate().equals(today))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long todayOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().equals(today))
                .count();

        // รายได้ 30 วันล่าสุด vs 30 วันก่อนหน้า
        BigDecimal thisMonthRevenue = sumRevenue(allOrders, last30Start, today.plusDays(1));
        BigDecimal lastMonthRevenue = sumRevenue(allOrders, prev30Start, last30Start);

        long thisMonthOrders = countOrders(allOrders, last30Start, today.plusDays(1));
        long lastMonthOrders = countOrders(allOrders, prev30Start, last30Start);

        long totalOrders = allOrders.size();
        long totalCustomers = userRepository.count();
        long cancelledOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                .count();

        double revenueChange = calcChangePercent(lastMonthRevenue, thisMonthRevenue);
        double ordersChange = calcChangePercent(lastMonthOrders, thisMonthOrders);

        return new DashboardSummaryResponse(
                todayRevenue, todayOrders,
                thisMonthRevenue, totalOrders,
                totalCustomers, cancelledOrders,
                revenueChange, ordersChange
        );
    }

    // [Claude] ข้อมูล SalesChart แบ่งตาม period: week / month / year
    public SalesChartResponse getSalesChart(String period) {
        List<Order> allOrders = orderRepository.findAll()
                .stream()
                .filter(o -> !isExcluded(o.getStatus()))
                .collect(Collectors.toList());

        List<DataPoint> points = switch (period) {
            case "month" -> buildMonthlyChart(allOrders);
            case "year"  -> buildYearlyChart(allOrders);
            default      -> buildWeeklyChart(allOrders); // "week" คือค่า default
        };

        return new SalesChartResponse(points);
    }

    // [Claude] ยอดขายแบ่งตาม category 30 วันย้อนหลัง สำหรับ DonutChart
    public CategorySalesResponse getCategorySales() {
        LocalDateTime start = LocalDateTime.now().minusDays(30);
        LocalDateTime end = LocalDateTime.now();

        // ดึง order lines ของเดือนนี้ที่ order ไม่ถูก cancel
        List<OrderLine> lines = orderLineRepository.findAll().stream()
                .filter(l -> !isExcluded(l.getOrder().getStatus()))
                .filter(l -> {
                    LocalDateTime created = l.getOrder().getCreatedAt();
                    return !created.isBefore(start) && !created.isAfter(end);
                })
                .collect(Collectors.toList());

        // group by category ของ product
        Map<String, BigDecimal> byCategory = lines.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getProduct().getCategory() != null
                                ? l.getProduct().getCategory().name()
                                : "OTHER",
                        Collectors.reducing(BigDecimal.ZERO,
                                OrderLine::getTotalPrice, BigDecimal::add)
                ));

        // แปลง enum name → ภาษาไทย
        Map<String, String> thaiName = Map.of(
                "BREAD",  "ขนมปัง",
                "CAKE",   "เค้ก",
                "COOKIE", "คุกกี้",
                "DRINK",  "เครื่องดื่ม"
        );

        List<CategoryData> result = byCategory.entrySet().stream()
                .map(e -> new CategoryData(
                        thaiName.getOrDefault(e.getKey(), e.getKey()),
                        e.getValue()))
                .collect(Collectors.toList());

        return new CategorySalesResponse(result);
    }

    // [Claude] top 7 สินค้าขายดีที่สุดใน 30 วันย้อนหลัง (วัดจาก quantity)
    public List<TopProductResponse> getTopProducts() {
        LocalDateTime start = LocalDateTime.now().minusDays(30);
        LocalDateTime end = LocalDateTime.now();

        List<OrderLine> lines = orderLineRepository.findAll().stream()
                .filter(l -> !isExcluded(l.getOrder().getStatus()))
                .filter(l -> {
                    LocalDateTime created = l.getOrder().getCreatedAt();
                    return !created.isBefore(start) && !created.isAfter(end);
                })
                .collect(Collectors.toList());

        // group by productId แล้วรวม qty และ revenue
        record ProductAgg(Integer id, String name, long qty, BigDecimal revenue, String img) {}

        Map<Integer, List<OrderLine>> byProduct = lines.stream()
                .collect(Collectors.groupingBy(l -> l.getProduct().getId().intValue()));

        return byProduct.entrySet().stream()
                .map(e -> {
                    List<OrderLine> group = e.getValue();
                    OrderLine first = group.get(0);
                    long qty = group.stream().mapToLong(OrderLine::getQuantity).sum();
                    BigDecimal revenue = group.stream()
                            .map(OrderLine::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new TopProductResponse(
                            e.getKey(),
                            first.getProductName(),
                            qty,
                            revenue,
                            first.getProduct().getImageUrl()
                    );
                })
                .sorted((a, b) -> Long.compare(b.getTotalQty(), a.getTotalQty()))
                .limit(7)
                .collect(Collectors.toList());
    }

    // ─── helpers ───────────────────────────────────────────────────────

    // [Claude] สร้าง data points เปรียบ 7 วันย้อนหลัง vs 7 วันก่อนหน้านั้น
    private List<DataPoint> buildWeeklyChart(List<Order> orders) {
        List<DataPoint> points = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDate prevDay = day.minusDays(7);
            BigDecimal cur = sumOnDay(orders, day);
            BigDecimal prev = sumOnDay(orders, prevDay);
            String label = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, new Locale("th"));
            points.add(new DataPoint(label, cur, prev));
        }
        return points;
    }

    // [Claude] สร้าง data points เปรียบ 12 เดือน ปีนี้ vs ปีที่แล้ว
    private List<DataPoint> buildYearlyChart(List<Order> orders) {
        List<DataPoint> points = new ArrayList<>();
        int thisYear = LocalDate.now().getYear();
        for (Month m : Month.values()) {
            LocalDate start = LocalDate.of(thisYear, m, 1);
            LocalDate end = start.plusMonths(1);
            LocalDate prevStart = LocalDate.of(thisYear - 1, m, 1);
            LocalDate prevEnd = prevStart.plusMonths(1);
            BigDecimal cur = sumRevenue(orders, start, end);
            BigDecimal prev = sumRevenue(orders, prevStart, prevEnd);
            String label = m.getDisplayName(TextStyle.SHORT, new Locale("th"));
            points.add(new DataPoint(label, cur, prev));
        }
        return points;
    }

    // [Claude] สร้าง data points เปรียบ 4 สัปดาห์ เดือนนี้ vs เดือนที่แล้ว
    private List<DataPoint> buildMonthlyChart(List<Order> orders) {
        List<DataPoint> points = new ArrayList<>();
        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate firstOfLastMonth = firstOfMonth.minusMonths(1);
        for (int w = 0; w < 4; w++) {
            LocalDate wStart = firstOfMonth.plusWeeks(w);
            LocalDate wEnd = wStart.plusWeeks(1);
            LocalDate prevStart = firstOfLastMonth.plusWeeks(w);
            LocalDate prevEnd = prevStart.plusWeeks(1);
            BigDecimal cur = sumRevenue(orders, wStart, wEnd);
            BigDecimal prev = sumRevenue(orders, prevStart, prevEnd);
            points.add(new DataPoint("Week " + (w + 1), cur, prev));
        }
        return points;
    }

    private BigDecimal sumOnDay(List<Order> orders, LocalDate day) {
        return orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().equals(day))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumRevenue(List<Order> orders, LocalDate from, LocalDate to) {
        return orders.stream()
                .filter(o -> !isExcluded(o.getStatus()))
                .filter(o -> {
                    LocalDate d = o.getCreatedAt().toLocalDate();
                    return !d.isBefore(from) && d.isBefore(to);
                })
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long countOrders(List<Order> orders, LocalDate from, LocalDate to) {
        return orders.stream()
                .filter(o -> {
                    LocalDate d = o.getCreatedAt().toLocalDate();
                    return !d.isBefore(from) && d.isBefore(to);
                })
                .count();
    }

    private double calcChangePercent(BigDecimal prev, BigDecimal cur) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return cur.subtract(prev)
                .divide(prev, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private double calcChangePercent(long prev, long cur) {
        if (prev == 0) return 0.0;
        return ((double)(cur - prev) / prev) * 100.0;
    }

    private boolean isExcluded(OrderStatus status) {
        return status == OrderStatus.CANCELLED || status == OrderStatus.REFUNDED;
    }
}
