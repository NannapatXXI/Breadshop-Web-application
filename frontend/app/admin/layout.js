// app/(app)/layout.js
'use client'; 
import { useState } from 'react'; 
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// V V V 1. Import "สมองตะกร้า" เข้ามา V V V
import { CartProvider } from '../CartContext';
import { AuthProvider } from '../context/AuthContext'; 
export default function AppLayout({ children }) {
  // (โค้ด State ของ Sidebar ของคุณ - เหมือนเดิม)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // V V V 2. "หุ้ม" ทุกอย่างด้วย Provider V V V
    <AuthProvider> 
      <CartProvider>
        <div className="flex h-screen bg-[#EEF4FB]">
          
          {/* (โค้ด Overlay ของคุณ - เหมือนเดิม) */}
          {isSidebarOpen && (
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
            />
          )}

          {/* (โค้ด Sidebar ของคุณ - เหมือนเดิม) */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
          />

          {/* (โค้ด Navbar และ main ของคุณ - เหมือนเดิม) */}
          <div className="flex-1 flex flex-col">
            <Navbar 
              setIsOpen={setIsSidebarOpen} 
            />
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </CartProvider>
    </AuthProvider> 
  );
}