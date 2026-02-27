// app/(app)/home/product/page.js
'use client'; 

// 1. Import เครื่องมือที่จำเป็น
import { useState } from 'react';
import { useCart } from '../../CartContext'; 
import { useEffect } from 'react';

import { FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import { AiFillProduct } from "react-icons/ai";

import { getproduct } from "@/services/auth.service";


// (เริ่ม Component - เหมือนเดิม)
export default function ProductPage() {

  // (States ทั้งหมด - เหมือนเดิม)
  const [imageFile, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  
  const { addToCart } = useCart(); 
  const [products, setProducts] = useState([]); 
  const [isAdminMode, setIsAdminMode] = useState(false); 
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');


  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {

    try {
      
      const res = await getproduct();
      console.log(res.data);

      setProducts(res.data);
  
    } catch (err) {
      console.error(err);
    }
  };



 

  const handleSelectProduct = (product) => {
    addToCart(); 
  };

 
  


  // (JSX - ส่วนแสดงผล)
  return (
    <div className="bg-[#EEF4FB] rounded-lg p-6 md:p-8">
      
      {/* (ส่วน Header - เหมือนเดิม) */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product</h2>
        <p className="text-gray-500">จัดการสินค้าของคุณ</p>
      </div>

    
      <div className="flex items-center justify-between  gap-4 mb-6  bg-white  shadow-md p-2 rounded-lg">
        
      
        <div className="inline-flex p-1 rounded-lg ">
          <div className = "grid grid-cols-[150px_10px_150px_150_150px] w-1000 gap-2 "> 
             
                  <button  className={`px-4 py-2 rounded-md font-semibold transition-all bg-blue-600 text-white  flex items-center justify-center  `}>
                    <AiFillProduct />  All products
                </button>
             
              <div className=' text-2xl text-gray-400 flex items-center justify-center'> 
                 |
              </div>
              
                  <button  className={`px-4 py-2 rounded-md font-semibold hover:bg-gray-200  text-gray-400  w-full`}>
                      Bread
                  </button>
             
                  <button  className={`px-4 py-2 rounded-md font-semibold  text-gray-400  hover:bg-gray-200  w-full`}>
                      Cake
                  </button>
             
                  <button  className={`px-4 py-2 rounded-md font-semibold  text-gray-400  hover:bg-gray-200  w-full`}>
                      Cookie
                  </button>
          </div> 
        </div>


        <div className="relative flex-1 ">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#E0EBF8]  "
          />
      </div>

        
      </div>

      
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
              
              <div className="h-48 flex items-center justify-center bg-gray-100">
                <img 
                  src={`http://localhost:8080/${product.imageUrl}`} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 h-10 overflow-hidden">{product.description}</p>
                <div className="border-t border-[#3A7BD5]-700 my-2">
                  <div>
                    
                  </div>
              </div> 
                <div className="flex justify-between items-center my-3">
                  <span className="text-2xl font-bold text-blue-600">฿{product.price.toLocaleString()}</span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    คงเหลือ {product.stock}
                  </span>
                </div>
                
                <div className="flex gap-2">

                    <button 
                      onClick={() => handleSelectProduct(product)}
                      className="w-full px-3 py-2 font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      เลือกซื้อ
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}