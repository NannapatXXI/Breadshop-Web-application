"use client";
import Link from 'next/link';
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // (เราจะใช้ toast แจ้งเตือน)

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); // 1. เพิ่ม State สำหรับ Loading
  const router = useRouter();

 
  
  const handleGoogleLogin = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/v1/auth/google`);
      const data = await res.json();
      window.location.href = data.url; // redirect ไป Google OAuth
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อ Google ได้");
    }
  };

  
  const handleSubmit = async (e) => { // (ต้องมี async)
    e.preventDefault();
    setError(""); // เคลียร์ Error
    setIsLoading(true); // 3. เริ่มหมุน (ปุ่มจะกดไม่ได้)

    // ตรวจสอบค่าว่าง (ฝั่ง Frontend)
    if (!email && !password) {
      setError("กรุณากรอก Email และ Password");
      setIsLoading(false); // 4. หยุดหมุน
      return;
    }
    if (!email) {
      setError("กรุณากรอก Email"); 
      setIsLoading(false); 
      return;
    }
    if (!password) {
      setError("กรุณากรอก Password"); 
      setIsLoading(false); 
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log("API_URL raw =", JSON.stringify(API_URL));

      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: email, password }),
      });
  
      const data = await res.json(); // ต้องอ่าน json ก่อนเพื่อเอา Token
       
      console.log("FULL RESPONSE =", data);
      if (res.ok) {
        // 1. เก็บ Token ลงใน localStorage (สมมติว่า Backend ส่ง field ชื่อ accessToken หรือ token)
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken); 
        } else if (data.token) {
          localStorage.setItem('token', data.token);
        }
  
        toast.success('เข้าสู่ระบบสำเร็จ!');
        router.push('/home'); 
      } else {
        setError(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className={styles.controls}>
        <div className={styles.container}>
            <div className={styles.controlsHead} >
                <h1 className="text-xl font-bold text-gray-700 mb-1">Welcome</h1>
                <h1 className="text-s font-normal text-gray-700 mb-10">Login to continue</h1>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.controlsBtn}>
                
                {/* Inputs */}
                <p className="text-s font-normal text-gray-700 mb-1">Username</p>
                <input
                    type="text"
                    placeholder="Username or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={isLoading} // 11. ปิดช่องกรอกตอนโหลด
                />
                
                <p className="text-s font-normal text-gray-700 mb-1 mt-10 " >
                    Password
                </p>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={isLoading} // 12. ปิดช่องกรอกตอนโหลด
                />

                {/* (แสดง Error) */}
                {error && (
                    <div className="text-red-600 text-sm mt-4 text-center font-medium">
                        {error}
                    </div>
                )}
                
                {/* ลิงก์ Forgot Password  */}
                <div className="flex justify-end mt-1 mb-4">
                    <Link href="/forgot-password">
                        <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer text-sm">
                            Forgot your password?
                        </span>
                    </Link>
                </div>

                {/* (ปุ่ม Login) */}
                <button 
                    type="submit" 
                    className="
                        bg-green-600 text-white py-3 px-6 font-bold rounded-lg 
                        hover:bg-green-700 transition duration-150 w-full cursor-pointer
                        disabled:bg-gray-400
                    "
                    disabled={isLoading} // 13. ปิดปุ่มตอนโหลด
                >
                    {/* 14. เปลี่ยนข้อความตอนโหลด */}
                    {isLoading ? 'กำลังโหลด...' : 'Login'}
                </button>
            </form>

            {/* (ส่วน "or") */}
            <div className={styles.controlsInfo} >
                <div className="flex items-center my-4 w-full">
                  <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">
                        or
                    </span>
                  <div className="flex-grow border-t border-gray-300"></div>
               </div>
            </div>

            {/* (ปุ่ม Google - แก้ Typo) */}
            <div  className={styles.controlsBtn}>
            <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="
                        bg-[#f0f9ff] text-[#475569] py-3 px-6 font-bold rounded-lg 
                        transition duration-150 w-full cursor-pointer
                        border-4 border-[#64748b] hover:bg-[#f0f9ff] hover:border-[#60a5fa]
                    "
                >
                    google
                </button>
            </div>

            {/* (ส่วน Sign up - แก้ /Register ให้ตรงกับโฟลเดอร์ R ตัวใหญ่ของคุณ) */}
            <div className="flex items-center justify-center mt-6">
                <p className="text-sm text-gray-700 mr-1">
                    Don't have an account? 
                </p>
                <Link href="/Register">
                    <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer text-sm font-medium">
                        Sign up.
                    </span>
                </Link>
            </div>
        </div>
    </div>
  );
}