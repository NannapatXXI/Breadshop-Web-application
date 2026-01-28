"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from 'react-hot-toast';
import Link from 'next/link';
// 1. Import useRouter ที่ขาดไป

import { useRouter } from 'next/navigation';

// (ClassNames เหมือนเดิม)
const containerClasses = "bg-white p-8 rounded-xl shadow-2xl w-full max-w-md";
const controlsClasses = "flex justify-center items-center min-h-screen p-4"; 

export default function RegisterPage() {

    // 2. เรียกใช้ useRouter เพื่อสร้างตัวแปร router ที่ขาดไป
    const router = useRouter();

    // (States และ Logic ทั้งหมดเหมือนเดิม)
    const [focusedField, setFocusedField] = useState(null); 
    const [error, setError] = useState(""); 
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const infoMessages = {
        username: "ชื่อผู้ใช้ต้องมีความยาว 4-20 ตัวอักษร และไม่มีอักขระพิเศษ",
        email: "กรุณาใช้อีเมลที่ถูกต้อง เช่น yourname@example.com",
        password: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร และควรมีตัวเลขหรือสัญลักษณ์",
        confirmPassword: "ยืนยันรหัสผ่านต้องตรงกับช่องรหัสผ่านด้านบน",
    };
    
    const handleConfirm = async(e) => {
       
        e.preventDefault(); 
        setError(""); 
        console.log("Submitting registration:", { username, email, password, confirmPassword });
        // (Validation Logic ทั้งหมดเหมือนเดิม)
        if (!username || !email || !password || !confirmPassword) {
            setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }
        const usernameRegex = /^[a-zA-Z0-9]+$/; 
        if (username.length < 4 || username.length > 20 || !usernameRegex.test(username)) {
            setError(infoMessages.username);
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(infoMessages.email);
            return;
        }
        const hasNumberOrSymbol = /\d/.test(password) || /[^a-zA-Z0-9]/.test(password);
        if (password.length < 6 || !hasNumberOrSymbol) {
            setError(infoMessages.password);
            return;
        }
        if (password !== confirmPassword) {
            setError(infoMessages.confirmPassword);
            return;
        }

        setIsLoading(true);
        try {
            // 5. ดึง URL ของ Backend จากตัวแปร (ตามที่เราคุยกัน)
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            console.log("📡 Full fetch URL:", `${API_URL}/api/v1/auth/register`);
            // 6. ยิง fetch ไปที่ Backend ของคุณ
            const res = await fetch(`${API_URL}/api/v1/auth/register`, { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({username, email, password }),
            });
      
            // 7. ตรวจสอบคำตอบจาก Server
            if (res.ok) {

              // ถ้า Server ตอบ 200 (สำเร็จ)
              toast.success('ลงทะเบียนสำเร็จ! กำลังกลับไปหน้า Login...');
              setTimeout(() => {
                router.push('/login');
              }, 1500);

            } else {
              // ถ้า Server ตอบ 401 หรืออื่นๆ (ไม่ผ่าน)
              const data = await res.json();
              setError(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            }
      
          } catch (err) {
            // 9. ถ้า fetch พัง (เช่น Network ตัด หรือ Backend ไม่ได้รัน)
            setError("ไม่สามารถเชื่อมต่อ Server ได้");
          } finally {
            setIsLoading(false); // 10. หยุดหมุน (ไม่ว่าจะสำเร็จหรือล้มเหลว)
          }
    };

    const FocusInfo = ({ fieldName }) => {
        return focusedField === fieldName && (
            <p className="text-xs !text-indigo-600 mt-1 font-medium">
                {infoMessages[fieldName]}
            </p>
        );
    };

    const inputFocusProps = (fieldName) => ({
        onFocus: () => setFocusedField(fieldName),
        onBlur: () => setFocusedField(null),
    });


    return (
        <div className={controlsClasses}>
            <div className={containerClasses}>
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Reset Password</h1>
                </div>
                
                <form onSubmit={handleConfirm} className="space-y-4">
                    {/* (Password Input) */}
                    <div>
                        <p className="text-xs font-medium text-gray-700 mb-1 mt-4">Password</p>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                {...inputFocusProps('password')} 
                                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 pr-10"
                            />
                            
                            <button
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        
                        </div> 
                        <FocusInfo fieldName="password" />
                    </div>


                    {/* (Confirm Password Input) */}
                    <div>
                        <p className="text-xs font-medium text-gray-700 mb-1 mt-4">Confirm password</p>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                {...inputFocusProps('confirmPassword')} 
                                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 pr-10"
                            />
                            
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-gray-700"
                                aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        
                        </div>
                        <FocusInfo fieldName="confirmPassword" />
                    </div>


                    {/* (Error Message) */}
                    {error && (
                        <div className="text-red-600 text-sm mt-4 text-center font-medium">
                            {error}
                        </div>
                    )}
                    
                    {/* (Buttons) */}
                    <div className="grid grid-cols-4 gap-0 mt-5 pt-4"> 
                        <a href="/login" className="col-span-1 mr-2"> 
                            <button
                                type="button" 
                                className="
                                    bg-[#94a3b8] text-[#475569] py-3 px-4 font-bold rounded-lg 
                                    hover:bg-[#f0f9ff] transition duration-150 w-full 
                                    cursor-pointer border-4 border-[#64748b] hover:border-[#60a5fa]
                                "
                            >
                                Back
                            </button>
                        </a>
                        <button
                            type="submit" 
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