// app/CartContext.js
'use client';

import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast'; // (เราจะใช้ toast ที่นี่ด้วย)

// 1. สร้าง Context (กล่องเปล่า)
const CartContext = createContext();

// 2. สร้าง "Provider" (ตัวหุ้ม) ที่จะเก็บ State และ Logic
export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  // ฟังก์ชันสำหรับ "เพิ่ม" ของ
  const addToCart = () => {
    setCartCount((prevCount) => prevCount + 1);
    toast.success('เพิ่มสินค้าลงตะกร้าแล้ว!');
  };

  // ฟังก์ชันสำหรับ "ล้าง" ตะกร้า
  const clearCart = () => {
    if (cartCount === 0) {
      toast.error('ตะกร้าว่างเปล่าอยู่แล้ว');
      return;
    }
    setCartCount(0);
    toast.success('ล้างตะกร้าเรียบร้อย');
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. สร้าง "Hook" (ทางลัด) เพื่อให้เรียกใช้ง่ายๆ
export function useCart() {
  return useContext(CartContext);
}