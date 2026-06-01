package com.breadShop.XXI.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.breadShop.XXI.entity.OrderLine;

public interface OrderLineRepository extends JpaRepository<OrderLine, Integer> {

    List<OrderLine> findByOrderId(Integer orderId);
}