// components/Sidebar.js

import Link from 'next/link';
import { useAuth } from "../context/AuthContext";
// 1. Import ไอคอน Home, Cog, SignOut, และ "Times" (ปุ่ม X)
import { FaHome, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { VscArchive } from "react-icons/vsc";


// 2. รับ props 'isOpen' และ 'setIsOpen'
export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, loading } = useAuth();
  console.log("Sidebar User:", user);
  return (
    // 3. เพิ่ม/แก้ไข ClassName ให้ Responsive
    <div 
      className={`
        w-64 h-screen bg-gray-800 text-white flex flex-col
        fixed inset-y-0 left-0 z-30 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}
    >
      {/* 4. เพิ่ม "ปุ่ม X" สำหรับปิดในจอมือถือ */}
      <div className="flex justify-between items-center p-5">
        <span className="text-2xl font-bold">My App</span>
        <button 
          onClick={() => setIsOpen(false)} // สั่งปิด
          className="md:hidden text-gray-400 hover:text-white"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* (ส่วน Links และ Logout เหมือนเดิม) */}
      <nav className="flex-1 px-4 py-2 space-y-2">
        <Link href="/home" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
          <FaHome className="mr-3" />
          Home
        </Link>

        <Link href="/product" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
            <VscArchive className="mr-3" />
          Product
        </Link>

        <Link href="/home/product" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
            <VscArchive className="mr-3" />
          History
        </Link>

        <Link href="/home/product" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
            <VscArchive className="mr-3" />
          Profile
        </Link>
        {/* ADMIN เห็น */}
          {user?.roles?.some(r => r.authority === "ROLE_ADMIN")&& (
            <>
              <Link href="/admin/dashbord" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
                <VscArchive className="mr-3" />
                Manage dashbord
              </Link>

              <Link href="/admin/products" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
                <FaCog className="mr-3" />
                Manage Product
              </Link>
            </>
          )}

      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link href="/login" className="flex items-center p-2 rounded-lg hover:bg-gray-700">
          <FaSignOutAlt className="mr-3" />
          Logout
        </Link>
      </div>
    </div>
  );
}