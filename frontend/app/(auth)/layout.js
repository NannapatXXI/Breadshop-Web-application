export default function AuthLayout({ children }) {
    // เราจะใช้ div นี้เพื่อสร้างพื้นหลังสีฟ้าและจัดกึ่งกลาง
    // (คุณสามารถเปลี่ยน className ให้เป็น Gradient ของคุณได้)
    return (
      <div className="flex justify-center items-center min-h-screen p-4" 
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 40%, #dbeafe 80%, #ffffff 100%)' }}
      >
        {children} {/* children คือ page.js ของ Login หรือ Register */}
      </div>
    );
  }

