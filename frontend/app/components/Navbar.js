// components/Navbar.js
import { FaBars, FaTrash } from 'react-icons/fa';
import { MdShoppingCart } from 'react-icons/md';
import Link from 'next/link'; // [Claude] ใช้ Link เพื่อไปหน้า profile
import { useCart } from '../CartContext';
import { useAuth } from "../context/AuthContext";
export default function Navbar({ setIsOpen }) {
  // 4. ดึง State และฟังก์ชันจาก "สมอง"
  const { cartCount, clearCart } = useCart();
  const { user, loading } = useAuth();
  console.log("Navbar User:" ,user?.username);

  return (
    <nav className="h-16 bg-white shadow-md flex items-center justify-between px-6">
      <div className="flex items-center">
        {/* (ปุ่ม Hamburger เหมือนเดิม) */}
        <button 
          onClick={() => setIsOpen(true)}
          className="text-gray-600 md:hidden mr-4"
        >
          <FaBars size={20} />
        </button>

        <h1 className="text-xl font-semibold text-gray-700"></h1>
      </div>
      
      {/* V V V 5. ส่วนตะกร้าและปุ่มลบ V V V */}
      <div className="flex items-center space-x-4">
        {/* [Claude] คลิกชื่อ user แล้วไปหน้า /profile */}
        <Link href="/profile" className="text-gray-600 hidden md:block hover:text-indigo-500 transition-colors">
          Welcome, {user?.username}
        </Link>

        {/* ปุ่มลบ */}
        <button 
          onClick={clearCart} // 6. สั่งล้างตะกร้า
          className="text-gray-500 hover:text-red-500"
          title="ล้างตะกร้า"
        >
          <FaTrash size={18} />
        </button>

        {/* ไอคอนตะกร้า (relative เพื่อให้ Badge ลอยได้) */}
        <div className="relative">
          <MdShoppingCart size={24} className="text-gray-600" />
          
          {/* Badge (ตัวเลข) */}
          {cartCount > 0 && (
            <span 
              className="
                absolute -top-2 -right-2 
                bg-red-500 text-white text-xs 
                rounded-full h-5 w-5 
                flex items-center justify-center
              "
            >
              {cartCount}
            </span>
          )}
        </div>
      </div>
      {/* ^ ^ ^ สิ้นสุดส่วนตะกร้า ^ ^ ^ */}
    </nav>
  );
}