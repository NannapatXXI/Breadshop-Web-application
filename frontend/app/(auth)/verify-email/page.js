"use client";
import Link from 'next/link';
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // (เราจะใช้ toast แจ้งเตือน)

export default function verificationPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); // 1. เพิ่ม State สำหรับ Loading
  const router = useRouter();

 
  
  const handleSubmitEmail = async () => {

   
  };

  
  
  
  

  return (
    <div className={styles.controls}>
        <div className={styles.container}>
            <div className={styles.controlsHead} >
                <h1 className="text-xl font-bold text-gray-700 mb-1">กรอกรหัสใน เมล</h1>
                <h1 className="text-s font-normal text-gray-700 mb-10">กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</h1>
            </div>
            
            <form  className={styles.controlsBtn}>
                
                {/* Inputs */}
                <p className="text-s font-normal text-gray-700 mb-1">Email</p>
                <input
                    type="text"
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
                                type="button" 
                                onClick={() => router.push("/login")}
                              
                                className="
                                    bg-[#94a3b8] text-[#475569] py-3 px-4 font-bold rounded-lg 
                                    hover:bg-[#f0f9ff] transition duration-150 w-full 
                                    cursor-pointer border-4 border-[#64748b] hover:border-[#60a5fa]
                                "
                            >
                                Back
                            </button>
                            </div>
                         
                          
                        <a href="/forgot-password"  className="col-span-3"> 
                        <button
                            type="button" 
                            //
                            className="
                                bg-green-600 text-white py-3 px-4 font-bold rounded-lg 
                                transition duration-150 w-full cursor-pointer hover:bg-green-700 
                                col-span-3
                            "
                        >
                            Confirm
                        </button>
                        </a>
                    </div>
                    
            </form>
            
           
          
        </div>
    </div>
  );
}