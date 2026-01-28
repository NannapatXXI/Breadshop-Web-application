"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // อันนี้ลบออกก็ได้ถ้าไม่ได้ใช้ router.push

export default function GoogleCallbackPage() {
  // const router = useRouter(); // ไม่ต้องใช้แล้ว

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // 1. บันทึก Token
      localStorage.setItem("token", token);
      
      // 2. บังคับรีโหลดหน้าใหม่เพื่อเข้าหน้า Home (เพื่อให้ AuthContext อ่านค่าใหม่)
      window.location.href = "/home"; 
      
    } else {
      alert("Login Google ล้มเหลว");
      window.location.href = "/login"; // ถ้าพลาดก็รีโหลดไปหน้า Login
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
        <p className="text-lg">กำลังเข้าสู่ระบบ Google...</p>
    </div>
  );
}