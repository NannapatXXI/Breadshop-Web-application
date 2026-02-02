"use client";
import Link from 'next/link';

import {useState,   // เก็บ state (ข้อมูลที่เปลี่ยนแปลงได้)
    useRef,     // เก็บ reference (อ้างอิง DOM element)
    useEffect   // ทำงานหลัง render
 } from "react";

import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // (เราจะใช้ toast แจ้งเตือน)

export default function verificationPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); // 1. เพิ่ม State สำหรับ Loading
  const router = useRouter();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);
  const length = 6; // ความยาวรหัส OTP
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  console.log("Token from URL:", token);
  const handleSubmitEmail = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`,  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          otp: otp.join("")
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "OTP ไม่ถูกต้อง");
      }
      console.log(otp);
      router.push(`/reset-password?token=${data.token}`);
       
        
   
  };


  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current box
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous box and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };


  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
       
      }
    }
   
    if(newOtp.every(digit => digit !== '')) {
        console.log("---------------------");
   
        console.log("OTP complete:", newOtp.join(''));
        // You can trigger OTP verification here

    }
      
        
  };

  const handlePaste = (e) => {
       e.preventDefault();
       const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
        const pastedArray = pastedData.split('').filter(char => /^\d$/.test(char));
    
       const newOtp = [...otp];
        pastedArray.forEach((char, idx) => {
         if (idx < length) {
            newOtp[idx] = char;
         }
        });
        setOtp(newOtp);
        
        // Focus on the next empty box or last box
        const nextEmptyIndex = newOtp.findIndex(val => !val);
        const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
        if (inputRefs.current[focusIndex]) {
          inputRefs.current[focusIndex].focus();
        }
        
  };

    const handleFocus = (index) => {
       if (inputRefs.current[index]) {
          inputRefs.current[index].select();
          
        }
 };
    
  
  
  
  

  return (
    <div className={styles.controls}>
        <div className={styles.container}>
            <div className={styles.controlsHead} >
                <h1 className="text-xl font-bold text-gray-700 mb-1">กรอกรหัสใน เมล</h1>
                <h1 className="text-s font-normal text-gray-700 mb-10">กรอกรหัส ของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</h1>
            </div>
            


            <form  className={styles.controlsBtn}>
                
           
            
            <div className="flex justify-center gap-3 mb-6">
                <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                <input
                key={index}
                    ref={el => {
                    inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                maxLength={1}
                    value={digit}
                onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    className="w-14 h-16 text-center text-2xl font-semibold
                            border-2 border-slate-300 rounded-lg
                            focus:border-orange-500 focus:ring-4 focus:ring-orange-200
                            outline-none transition-all duration-200
                            bg-slate-50 text-slate-800
                        hover:border-orange-400"
                    aria-label={`OTP digit ${index + 1}`}
                    />
            ))}
            </div>
          </div>
              
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
                         
                          
                        
                        <div className="col-span-3 mt-1">
                        <button
                            type="button" 
                            //
                            onClick={handleSubmitEmail}
                            className="
                                bg-green-600 text-white py-3 px-4 font-bold rounded-lg 
                                transition duration-150 w-full cursor-pointer hover:bg-green-700 
                                col-span-3
                            "
                        >
                            Sead 
                        </button>
                      
                        </div>
                    </div>
                    
            </form>
            
           
          
        </div>
    </div>
  );
}