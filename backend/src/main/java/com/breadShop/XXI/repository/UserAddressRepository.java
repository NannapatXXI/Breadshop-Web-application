package com.breadShop.XXI.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.breadShop.XXI.entity.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress, Integer> {

    List<UserAddress> findByUserId(Integer userId);

    Optional<UserAddress> findByUserIdAndIsDefaultTrue(Integer userId);

    boolean existsByUserIdAndIsDefaultTrue(Integer userId);
}