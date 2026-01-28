// app/(app)/home/product/page.js
'use client'; 

// 1. Import เครื่องมือที่จำเป็น
import { useState } from 'react';
import { useCart } from '../../../CartContext'; 
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa'; 

// (ข้อมูลสินค้าเริ่มต้น - เหมือนเดิม)
const initialProducts = [
  {
    id: 1,
    name: "เสื้อยืด Cotton Premium",
    price: 299,
    stock: 50,
    icon: "👕",
    description: "เสื้อยืดคอตตอน 100% นุ่มสบาย ระบายอากาศดี"
  },
  {
    id: 2,
    name: "กางเกงยีนส์",
    price: 890,
    stock: 30,
    icon: "👖",
    description: "กางเกงยีนส์ทรงสวย ผ้าคุณภาพดี ใส่สบาย"
  },
  {
    id: 3,
    name: "รองเท้าผ้าใบ",
    price: 1590,
    stock: 20,
    icon: "👟",
    description: "รองเท้าผ้าใบสไตล์สปอร์ต น้ำหนักเบา"
  }
];

// (เริ่ม Component - เหมือนเดิม)
export default function ProductPage() {

  // (States ทั้งหมด - เหมือนเดิม)
  const { addToCart } = useCart(); 
  const [products, setProducts] = useState(initialProducts); 
  const [isAdminMode, setIsAdminMode] = useState(false); 
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');

  // (Logic Functions - เหมือนเดิม)
  const handleAddProduct = (e) => {
    e.preventDefault(); 
    if (!name || !price || !stock) {
      alert('กรุณากรอก ชื่อ, ราคา, และจำนวน');
      return;
    }
    const newProduct = {
      id: Date.now(), 
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      icon: icon || '🎁',
      description: description || 'ไม่มีรายละเอียด'
    };
    setProducts([newProduct, ...products]); // (แก้ให้เพิ่มด้านบนสุด)
    
    setName(''); setPrice(''); setStock(''); setIcon(''); setDescription('');
  };

  const handleDeleteProduct = (id) => {
    if (confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSelectProduct = (product) => {
    addToCart(); 
  };

  //
  // V V V 1. ฟังก์ชันใหม่สำหรับปุ่มเทส V V V
  //
  const handleTestAddCard = () => {
    const testProduct = {
      id: Date.now(), // ID ใหม่
      name: "สินค้าทดสอบ (เปล่า)",
      price: 0,
      stock: 0,
      icon: "❓",
      description: "นี่คือการ์ดทดสอบที่สร้างขึ้น"
    };
    // (เพิ่มการ์ดทดสอบนี้เข้าไปใน State ด้านบนสุด)
    setProducts(prevProducts => [testProduct, ...prevProducts]);
  };
  //
  // ^ ^ ^ สิ้นสุดฟังก์ชันใหม่ ^ ^ ^
  //


  // (JSX - ส่วนแสดงผล)
  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      
      {/* (ส่วน Header - เหมือนเดิม) */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product</h2>
        <p className="text-gray-500">จัดการสินค้าของคุณ</p>
      </div>

      {/* ส่วนสลับโหมด (Mode Toggle) + ปุ่มเทส */}
      {/* (ผมครอบด้วย flex-wrap เพื่อให้ปุ่มตกบรรทัดได้ในจอมือถือ) */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        
        {/* (ปุ่มสลับโหมด - เหมือนเดิม) */}
        <div className="inline-flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setIsAdminMode(false)}
            className={`px-4 py-2 rounded-md font-semibold transition-all
              ${!isAdminMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600'}
            `}
          >
            👤 ลูกค้า
          </button>
          <button 
            onClick={() => setIsAdminMode(true)}
            className={`px-4 py-2 rounded-md font-semibold transition-all
              ${isAdminMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600'}
            `}
          >
            👨‍💼 Admin
          </button>
        </div>

        {/*
          V V V 2. ปุ่มใหม่สำหรับเทส V V V
        */}
        <button
          onClick={handleTestAddCard}
          className="
            px-4 py-2 bg-purple-500 text-white 
            font-semibold rounded-lg shadow-md 
            hover:bg-purple-600 transition duration-150
          "
        >
          🧪 เทสสร้างการ์ดเปล่า
        </button>
        {/* ^ ^ ^ สิ้นสุดปุ่มใหม่ ^ ^ ^ */}

      </div>

      {/* (Panel Admin - เหมือนเดิม) */}
      {isAdminMode && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">➕ เพิ่มสินค้าใหม่</h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ราคา (บาท) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนคงเหลือ *</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ไอคอน Emoji</label>
                <input type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="🎁"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
            <button type="submit" 
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
            >
              เพิ่มสินค้า
            </button>
          </form>
        </div>
      )}

      {/* (Grid แสดงสินค้า - เหมือนเดิม) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h3 className="text-xl font-semibold text-gray-600">ยังไม่มีสินค้า</h3>
            <p className="text-gray-400">เริ่มเพิ่มสินค้าใหม่โดยเปลี่ยนเป็นโหมด Admin</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} 
                 className="bg-white rounded-lg shadow border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              
              <div className="h-48 flex items-center justify-center text-6xl bg-gray-100">
                {product.icon}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 h-10 overflow-hidden">{product.description}</p>
                
                <div className="flex justify-between items-center my-3">
                  <span className="text-2xl font-bold text-blue-600">฿{product.price.toLocaleString()}</span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    คงเหลือ {product.stock}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {isAdminMode ? (
                    <>
                      <button className="flex-1 px-3 py-2 text-xs font-bold bg-yellow-400 text-gray-800 rounded-md hover:bg-yellow-500 flex items-center justify-center gap-1">
                        <FaEdit /> แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center gap-1">
                        <FaTrash /> ลบ
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleSelectProduct(product)}
                      className="w-full px-3 py-2 font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      เลือกซื้อ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}