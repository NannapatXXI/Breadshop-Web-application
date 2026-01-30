"use client";
import Link from 'next/link';
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // (เราจะใช้ toast แจ้งเตือน)

export default function forgotpassPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); // 1. เพิ่ม State สำหรับ Loading
  const router = useRouter();

 
  const backtologin = () => {
    router.push('/login'); 
  };



  const handleSubmitEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("กรุณากรอก Email");
      return;
    }else  if (!emailRegex.test(trimmedEmail)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log("API_URL raw =", JSON.stringify(API_URL));


      const res = await fetch(`${API_URL}/api/v1/auth/checkpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "ไม่สามารถส่ง Email ได้");
      }
  
      toast.success("ส่งอีเมลสำเร็จ");
      router.push("/verify-email");
  
    } catch (err) {
      toast.error(err.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setIsLoading(false);
    }
  };
  

  
  
  
  

  return (
    <div className={styles.controls}>
        <div className={styles.container}>
            <div className={styles.controlsHead} >
                <h1 className="text-xl font-bold text-gray-700 mb-1">Change Password</h1>
                <h1 className="text-s font-normal text-gray-700 mb-10">กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</h1>
            </div>
            
            <form  className={styles.controlsBtn}>
                
                {/* Inputs */}
                <p className="text-s font-normal text-gray-700 mb-1">Email</p>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={isLoading} // 11. ปิดช่องกรอกตอนโหลด
                />
                
              
                {/* (แสดง Error) */}
                {error && (
                    <div className="text-red-600 text-sm mt-4 text-center font-medium">
                        {error}
                    </div>
                )}
                
               
                <div className="grid grid-cols-4 gap-0 mt-5 pt-4"> 
                      
                          <div className="col-span-1 mr-2">
                            <button
                             onClick={backtologin}
                                type="button" 
                                className="
                                    bg-[#94a3b8] text-[#475569] py-3 px-4 font-bold rounded-lg 
                                    hover:bg-[#f0f9ff] transition duration-150 w-full 
                                    cursor-pointer border-4 border-[#64748b] hover:border-[#60a5fa]
                                "
                            >
                                Back
                            </button>
                            </div>
                    
                         
                        <button
                            type="button" 
                            onClick={handleSubmitEmail}
                            className="
                                bg-green-600 text-white py-3 px-4 font-bold rounded-lg 
                                transition duration-150 w-full cursor-pointer hover:bg-green-700 
                                col-span-3
                            "
                        >
                            Confirm
                        </button>
                        
                    </div>
            </form>

           
          
        </div>
    </div>
  );
}