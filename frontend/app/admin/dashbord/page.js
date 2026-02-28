// app/(app)/home/page.js
'use client'; 

import { useEffect ,useState } from 'react'; // 1. Import useEffect
import { useCart } from '../../CartContext';
import { useAuth } from '../../context/AuthContext'; 
import { getMe } from "@/services/auth.service";
import { MdOutlineAttachMoney } from "react-icons/md";
import { BiChevronDownSquare,BiGroup,BiMessageSquareX } from "react-icons/bi";
import SalesChart from "../../components/SalesChart";

export default function HomePage() {
  
  const [active, setActive] = useState("A");
  const { addToCart } = useCart();
  const { user, loading } = useAuth(); // ดึง User มาดูด้วย
  const [mail, setMail] = useState("");
  const [count, setCount] = useState(0);


  useEffect(() => {
  
    const token = localStorage.getItem('token');
    
    
    console.log("=========== DEBUG LOGIN ===========");
    console.log("Token:", token);      
    console.log("User:", user);      
    console.log("Loading:", loading);  
    console.log("===================================");
  }, [user, loading]); // ให้ทำงานใหม่เมื่อ user หรือ loading เปลี่ยนแปลง

 
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

  const getGraph = () => {
    switch (count) {
      case 0:
        return "ยอดขายรายสัปดาห์";
      case 1:
        return "ยอดขายรายเดือน";
      case 2:
        return "ยอดขายรายปี";
      default:
        return "กรุณาเลือกช่วงเวลา";
    }
  };
  const getInfoGraph = () => {
    switch (count) {
        case 0:
          return "เปรียบเทียบกับสัปดาห์ที่แล้ว";
        case 1:
          return "เปรียบเทียบกับเดือนที่แล้ว";
        case 2:
          return "เปรียบเทียบกับปีที่แล้ว";
        default:
          return "กรุณาเลือกช่วงเวลา";
      }
  };
  const perweek = () => {
    setCount(0);
  };
  const permonth = () => {
    setCount(1);
  };
 
  const peryear= () => {
    setCount(2);
  };

  

  return (
    <div className='w-full min-h-screen bg-[#EEF4FB]'>
        <div className='w-full h-36 grid grid-cols-2 gap-2  bg-[#0B1F33] bg-[radial-gradient(circle_at_80%_50%,rgba(58,123,213,0.35),transparent_40%)]  rounded-2xl'>   
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

            <div className="bg-white rounded-2xl shadow-md  flex border-b-2 border-blue-500">

              
                <div className="mt-4  pb-4 pl-5">
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
                <div className=" items-end  pl-4 pt-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                         <MdOutlineAttachMoney size={28} className="text-blue-600" />
                    </div>
                </div>
               
            </div>

            <div className="bg-white rounded-2xl shadow-md  flex border-b-2 border-green-500">

              
                <div className="mt-4  pb-4 pl-5">
                    <p className="text-gray-400 text-sm mb-4">
                        ออเดอร์ทั้งหมด
                    </p>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        1123
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
                <div className=" items-end  pl-4 pt-4">
                    <div className="bg-green-100 p-4 rounded-xl">
                         <BiChevronDownSquare  size={28} className="text-green-600" />
                    </div>
                </div>
               
            </div>
            <div className="bg-white rounded-2xl shadow-md  flex border-b-2 border-orange-500">

                <div className="mt-4  pb-4 pl-5">
                    <p className="text-gray-400 text-sm mb-4">
                        ลูกค้าทั้งหมด
                    </p>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        58
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
                <div className=" items-end  pl-4 pt-4">
                    <div className="bg-orange-100 p-4 rounded-xl">
                         <BiGroup size={28} className="text-orange-600" />
                    </div>
                </div>
               
            </div>
            <div className="bg-white rounded-2xl shadow-md  flex border-b-2 border-red-500">

              
                <div className="mt-4  pb-4 pl-5">
                    <p className="text-gray-400 text-sm mb-4">
                        ออเดอร์ยกเลิก
                    </p>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                       12
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
                <div className=" items-end  pl-4 pt-4">
                    <div className="bg-red-100 p-4 rounded-xl">
                         <BiMessageSquareX size={28} className="text-red-600" />
                    </div>
                </div>
               
            </div>

        </div>

        <div className="grid grid-cols-3 gap-4  mt-6">
            <div className=' col-span-2  h-96 rounded-2xl bg-white  shadow-md ' >
                    <div className=" m-2 h-full flex flex-col">

                        <div className=' border-red-500 border-2 h-16 w-full flex  items-center   text-gray-500 font-semibold'> 

                                <div className=' w-1/2'>
                                        <h1 className='text-black text-2xl'>{getGraph()}</h1>
                                        <p className='text-sm'>{getInfoGraph()}</p>
                                </div>
                                <div className=' w-1/2 flex items-center justify-end pr-4'>
                                       
                                       <div className = 'flex gap-2 items-center justify-end pr-4'>
                                               <button  onClick={() => {
                                                            setActive("A");
                                                            perweek();
                                                        }}
                                                        className={`px-4 py-2 rounded-md font-semibold transition-all ${
                                                            active === "A"
                                                            ? "bg-[#0F2235] text-[#A8CEFF]"
                                                            : "hover:bg-gray-200 text-gray-400"
                                                        }`}
                                                        >
                                                        สัปดาห์
                                                </button>
                                                <button onClick={() => {
                                                        setActive("B");
                                                        permonth();
                                                    }}
                                                    className={`px-4 py-2 rounded-md font-semibold transition-all ${
                                                        active === "B"
                                                        ? "bg-[#0F2235] text-[#A8CEFF]"
                                                        : "hover:bg-gray-200 text-gray-400"
                                                    }`}
                                                    >
                                                    เดือน
                                                </button>
                                                 <button onClick={() => {
                                                        setActive("C");
                                                        peryear();
                                                    }}
                                                    className={`px-4 py-2 rounded-md font-semibold transition-all ${
                                                        active === "C"
                                                        ? "bg-[#0F2235] text-[#A8CEFF]"
                                                        : "hover:bg-gray-200 text-gray-400"
                                                    }`}
                                                    >
                                                    ปี
                                                </button>
                                       </div>
                                </div>
                    
                         </div>
                         <div className="flex-1 p-4 ">
                             <SalesChart period={active} />
                         </div>
                    </div>
            </div>
           
           
                <div className='  h-96 rounded-2xl bg-white  shadow-md ' >
                        <div className=" m-2 border-red-500 border-2  h-96">
                            <div> หมวดหมู่สินค้า</div>
                        </div>
                </div>
           
        </div>
        <div className=' border-red-500 border-2  h-96 w-full mt-6 rounded-2xl bg-white  shadow-md ' >
            History Order
        </div>
    </div>
  );
}