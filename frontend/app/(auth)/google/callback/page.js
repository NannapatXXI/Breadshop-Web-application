"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // อันนี้ลบออกก็ได้ถ้าไม่ได้ใช้ router.push

export default function GoogleCallbackPage() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const router = useRouter();

    if (token) {
      // 1. บันทึก Token
      localStorage.setItem("token", token);
      
      router.push('/home');
      
    } else {
      alert("Login Google ล้มเหลว");
      router.push('/login'); 
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
        <p className="text-lg">กำลังเข้าสู่ระบบ Google...</p>
    </div>
  );
}