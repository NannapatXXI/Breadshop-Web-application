package com.breadShop.XXI.repository;

import com.breadShop.XXI.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// --- 2. Database Repository ---
// (Interface สำหรับคุยกับตาราง User)
@Repository
public interface UserRepository extends JpaRepository<User, Integer> { // (ใช้ ID เป็น Integer)
    
    // (Spring Data JPA จะสร้าง query ให้เราอัตโนมัติ)
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
}