// app/(app)/home/page.js
'use client'; 

import { useEffect ,useState } from 'react'; // 1. Import useEffect
import { useCart } from '../../CartContext';
import { useAuth } from '../../context/AuthContext'; 
import { getMe } from "@/services/auth.service";

export default function HomePage() {
  
  const { addToCart } = useCart();
  const { user, loading } = useAuth(); // ดึง User มาดูด้วย
  const [mail, setMail] = useState("");

  // -------------------------------------------------------
  // ส่วนที่เพิ่ม: ดึง Token มา Log เมื่อหน้าเว็บโหลด
  // -------------------------------------------------------
  useEffect(() => {
    // ดึง Token จาก LocalStorage
    const token = localStorage.getItem('token');
    
    
    console.log("=========== DEBUG LOGIN ===========");
    console.log("Token:", token);      // ดูค่า Token
    console.log("User:", user);        // ดูค่า User จาก Context
    console.log("Loading:", loading);  // ดูสถานะ Loading
    console.log("===================================");
  }, [user, loading]); // ให้ทำงานใหม่เมื่อ user หรือ loading เปลี่ยนแปลง

  // 🔹 โหลดค่าจาก localStorage ตอนหน้าโหลด
  useEffect(() => {
    const savedMail = localStorage.getItem("test_mail");
    if (savedMail) {
      setMail(savedMail);
    }
  }, []);

  // บันทึกลง localStorage ทุกครั้งที่ mail เปลี่ยน
  useEffect(() => {
    localStorage.setItem("test_mail", mail);
  }, [mail]);
  const handleTestClick = async () => {
    //addToCart();
   

    try {
      
      const res = await getMe();
      console.log(res.data);
  
      if (!res.ok) {
        throw new Error(res.data.message || "ไม่สามารถส่ง Email ได้");
      }
  
    } catch (err) {
     
    } finally {
     
    }
  };

  return (
    <div className='w-full h-screen flex items-center justify-center bg-black'>
    
    </div>
  );
}