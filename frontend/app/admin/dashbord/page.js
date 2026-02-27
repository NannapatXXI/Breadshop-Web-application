// app/(app)/home/page.js
'use client'; 

import { useEffect ,useState } from 'react'; // 1. Import useEffect
import { useCart } from '../../CartContext';
import { useAuth } from '../../context/AuthContext'; 
import { getMe } from "@/services/auth.service";
import { MdOutlineAttachMoney } from "react-icons/md";

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
    console.log("User ตอน render:", user);
  }, [user]); // ให้ทำงานใหม่เมื่อ user เปลี่ยนแปลง

  // บันทึกลง localStorage ทุกครั้งที่ mail เปลี่ยน
  useEffect(() => {
    localStorage.setItem("test_mail", mail);
  }, [mail]);

  const getGreeting = () => {
    const hour = new Date().getHours();
  
    if (hour < 11) return "GOOD MORNING";
    if (hour < 16) return "GOOD AFTERNOON";
    if (hour < 19) return "GOOD EVENING";
    return "สวัสดีตอนค่ำ";
  };

  return (
    <div className='w-full h-screen  bg-[#EEF4FB] border-4 border-red-500'>
        
        <div className='w-full h-36 grid grid-cols-2 gap-2  bg-[#0B1F33] bg-[radial-gradient(circle_at_80%_50%,rgba(58,123,213,0.35),transparent_40%)]  rounded-md'>   
            <div className=' text-white w-full h-36 '>

                <div className='text-[#8ba6ca] text-2xl font-bold pt-8 pl-10'>
                        <p className='text-sm pb-2'>{getGreeting()}</p>
                        <h1 className='text-white'>ยินดีต้อนรับกลับมา, 
                        <span className="text-[#A8CEFF] font-semibold pb-2">
                            {user?.username || "ผู้ใช้"}
                        </span>
                        </h1>
                        <p className='text-sm text-gray-500'>วันนี้มีออเดอร์ใหม่ ... รายการ</p>


                </div>
                    
            </div>
            <div className=' text-white w-full h-36 '>

                <div className='grid grid-cols-[150px_10px_150px_10px_150px] w-1000 gap-2  items-center  justify-end h-full  '>
                    <div>
                        <p className='text-2xl font-bold'>฿ 12,345</p>
                        <h1 className='text-sm text-gray-400'>ยอดขายวันนี้</h1>
                    </div>

                    <div className=' text-2xl text-gray-400 flex items-center justify-center'> 
                          |
                    </div>

                    <div>
                        <p className='text-2xl font-bold'>123</p>
                        <h1 className='text-sm text-gray-400'>คำสั่งซื้อวันนี้</h1>
                    </div> 

                    <div className=' text-2xl text-gray-400 flex items-center justify-center'> 
                          |
                        </div>
                    <div>
                        <p className='text-2xl font-bold'>45</p>
                        <h1 className='text-sm text-gray-400'>ลูกค้าทั้งหมด</h1>
                    </div>
                </div>
                    
            </div>
        </div>


        <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6'>


            <div className="bg-white rounded-2xl shadow-md p-6 relative border-b-2 border-blue-500">
                <div className=" items-end border-2 border-blue-500">
                    <div className="bg-blue-100 p-4 rounded-xl">
                    <MdOutlineAttachMoney size={28} className="text-blue-600" />
                    </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                    รายได้รวมเดือนนี้
                </p>

                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    ฿84,320
                </h1>

                <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">
                    ▲ +12.4%
                    </span>
                    <span className="text-gray-400 text-sm">
                    vs เดือนที่แล้ว
                    </span>
                </div>
            </div>

            <div className=' bg-white rounded-md shadow-md  border-b-2 border-green-500'>
                <p className='text-sm text-gray-400'>รายได้เดือนนี้</p>
                <h1 className='text-2xl font-bold'>฿ 12,345</h1>
            </div>
            <div className=' bg-white rounded-md shadow-md  border-b-2 border-orange-500'>
                <p className='text-sm text-gray-400'>รายได้เดือนนี้</p>
                <h1 className='text-2xl font-bold'>฿ 12,345</h1>
            </div>
            <div className=' bg-white rounded-md shadow-md  border-b-2 border-red-500'>
                <p className='text-sm text-gray-400'>รายได้เดือนนี้</p>
                <h1 className='text-2xl font-bold'>฿ 12,345</h1>
            </div>

        </div>
    </div>
  );
}