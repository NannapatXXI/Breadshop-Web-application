// app/(app)/home/page.js
'use client'; 

import { useEffect } from 'react'; // 1. Import useEffect
import { useCart } from '../../CartContext';
import { useAuth } from '../../context/AuthContext'; 
import { getMe } from "@/services/auth.service";

export default function HomePage() {
  
  const { addToCart } = useCart();
  const { user, loading } = useAuth(); // ดึง User มาดูด้วย

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
    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome to your Dashboard!
        {/* ลบ console.log ออกจากตรงนี้ เพราะมันจะไปโผล่เป็นข้อความบนหน้าเว็บครับ */}
      </h1>
      
      {/* แสดงชื่อ User ถ้า Login แล้ว (ตัวอย่างการใช้) */}
      {user && (
        <p className="text-green-600 font-medium">
           สวัสดีคุณ: {user.username || user.email}
        </p>
      )}

      <p className="mt-2 text-gray-600">
        นี่คือเนื้อหาของหน้า Home ที่มาจาก `home/page.js`
      </p>

      <button
        onClick={handleTestClick}
        className="
          mt-6 px-4 py-2 bg-blue-600 text-white 
          font-semibold rounded-lg shadow-md 
          hover:bg-blue-700 transition duration-150
        "
      >
        ทดสอบ (กดเพื่อเพิ่มสินค้า & Log Token)
      </button>
    </div>
  );
}