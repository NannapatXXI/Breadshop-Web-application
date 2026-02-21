// app/(app)/home/product/page.js
'use client'; 

// 1. Import เครื่องมือที่จำเป็น
import { useState,useRef } from 'react';
import { useCart } from '../../CartContext'; 
import { useEffect } from 'react';
import toast from 'react-hot-toast'; // (เราจะใช้ toast แจ้งเตือน)
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa'; 
import { getproduct,addproduct } from "@/services/auth.service";
import Cropper from "react-easy-crop";





// (เริ่ม Component - เหมือนเดิม)
export default function ProductPage() {

  // (States ทั้งหมด - เหมือนเดิม)
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);     // รูปดิบก่อน crop
  const [imageFile, setImageFile] = useState(null);   // รูปหลัง crop (final)
  const [showCrop, setShowCrop] = useState(false);    // เปิด modal crop
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [showPreview, setShowPreview] = useState(false); 
  const [showPreviewOfAddProduct, setShowPreviewOfAddProduct] = useState(false);
  

  const [error, setError] = useState(""); 
  const { addToCart } = useCart(); 
  const [products, setProducts] = useState([]); 
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState("BREAD");
  const [expiryDate, setExpiryDate] = useState("");


  const [description, setDescription] = useState('');


  useEffect(() => {
    fetchProducts();
  }, []);
  
  // ดึงข้อมูลสินค้าเมื่อหน้าโหลด และเมื่อมีการเปลี่ยนแปลง
  const fetchProducts = async () => {

    try {
      
      const res = await getproduct();
      console.log(res.data);

      setProducts(res.data);
  
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCrop(true);   // เปิด modal crop ทันที
    };
    reader.readAsDataURL(file);
  };
  

  const handlegetproduct = async () => {
  
    try {
      
      const res = await getproduct();
      console.log(res.data);
  
    } catch (err) {
      console.error(err);
    }
  };

  
  // (Logic Functions - เหมือนเดิม)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
  
    if (!name || !price || !stock) {
     
      toast.error("กรุณากรอก ชื่อ, ราคา, และจำนวน");
      
      return;
    }
  
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("category", category); 
    formData.append("expiryDate", expiryDate); // ใส่ที่เลิกรับ order
  
   console.log("FormData:", formData.get("name"), formData.get("price"), formData.get("stock"), formData.get("description"), formData.get("image"));
   try {
    const res = await addproduct(formData);
  
    const newProduct = res.data;
  
    setProducts(prev => [newProduct, ...prev]);
    setShowPreviewOfAddProduct(false); 
    setName('');
    setPrice('');
    setStock('');
    setDescription('');
    setImageSrc(null);
   
    fileInputRef.current.value = ""; 
    toast.success("เพิ่มสินค้าสำเร็จ");
  
  } catch (err) {
    console.error(err);
    toast.error("เพิ่มสินค้าไม่สำเร็จ");
  }
  };
  

  const handleDeleteProduct = (id) => {
    if (confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSelectProduct = (product) => {
    console.log("Selected product:", product);
    addToCart(); 
  };

  
  const getCroppedImg = (imageSrc, crop) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = imageSrc;
  
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = crop.width;
        canvas.height = crop.height;
  
        const ctx = canvas.getContext("2d");
  
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );
  
        canvas.toBlob((blob) => {
          const file = new File([blob], "cropped.jpeg", {
            type: "image/jpeg",
          });
          resolve(file);
        }, "image/jpeg");
      };
    });
  };
  




  // (JSX - ส่วนแสดงผล)
  return (
    <div className="bg-[#EEF4FB] rounded-lg  p-6 md:p-8">
      
      {/* (ส่วน Header - เหมือนเดิม) */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product</h2>
        <p className="text-gray-500">จัดการสินค้าของคุณ</p>
      </div>

      {/* ส่วนสลับโหมด (Mode Toggle) + ปุ่มเทส */}
      {/* (ผมครอบด้วย flex-wrap เพื่อให้ปุ่มตกบรรทัดได้ในจอมือถือ) */}
     
        <div className="bg-gray-50 p-6 rounded-lg border-2 mb-8 ">
          <h3 className="text-lg font-bold text-gray-800 mb-4">➕ เพิ่มสินค้าใหม่</h3>
          <form onSubmit={handleAddProduct} className="space-y-4 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ราคา (บาท) *</label>
                <input type="number"  min="0" value={price} onChange={(e) => {const value = Number(e.target.value); if (value >= 0) {   setPrice(value);   }}}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนคงเหลือ *</label>
                <input type="number"  min="0" value={stock} onChange={(e) => {const value = Number(e.target.value); if (value >= 0) {   setStock(value);   }}}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ไอคอน </label>
                <input  type="file" ref={fileInputRef} onChange={handleImageChange} required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  หมวดหมู่สินค้า *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full px-3  h-11  border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BREAD"> Bread</option>
                  <option value="CAKE"> Cake</option>
                  <option value="DRINK"> Drink</option>
                </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
              วันปิดรับ order
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="
                  mt-1 block w-full px-3 py-2
                  border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
          </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">รายละเอียด</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
            <button type="button" 
           onClick={() => setShowPreviewOfAddProduct(true)}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
            >
              เพิ่มสินค้า
            </button>
          </form>
        </div>
      

    
      {/* (table ) */}
      <div className="bg-white shadow-md rounded-xl p-6">
  
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 ">
            <tr>
              <th className="px-4 py-3 text-center text-sm  font-semibold text-gray-600">
               id
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
               name
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                price
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                stock
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                description
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                category
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                expiryDate
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                Image URL
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                Functions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
          {products.map((product,index) => (

            console.log("สินค้า",product),

            <tr key={product.id} className="border-t  text-left  hover:bg-gray-50">
              <td className="px-4 py-2">{index + 1}</td> 
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.price}</td>
              <td className="px-4 py-2">{product.stock}</td>
              <td className="px-4 py-2">{product.description}</td>
              <td className="px-4 py-2">{product.category}</td>
              <td className="px-4 py-2">{product.expiryDate}</td>
              <td className="px-4 py-2">{product.imageUrl}</td>
              <td className="px-4 py-2 flex gap-2">
                <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
                  ลบ
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  แก้ไข
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                
                onClick={() =>{
                  setSelectedProduct(product);
                  setShowPreview(true);
                }}
                >
                  
                  preview
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
    </div>

      
      {/* (Modal แสดง Preview ก่อนเพิ่มสินค้า) */}
      {showPreviewOfAddProduct && (
       <div
       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
       onClick={() => setShowPreviewOfAddProduct(false)}
     >
       <div
         className="bg-white p-6 rounded-xl w-96 shadow-xl"
         onClick={(e) => e.stopPropagation()}
       >
            
            <h2 className="text-lg font-bold mb-4">Preview สินค้า</h2>

            <p><b>ชื่อ:</b> {name}</p>
            <p><b>ราคา:</b> {price}</p>
            <p><b>จำนวน:</b> {stock}</p>
            <p><b>รายละเอียด</b> {description}</p>
            <p><b>วันปิดรับ order:</b> {expiryDate}</p>

            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="mt-3 h-40 w-full object-cover rounded"
              />
            )}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowPreviewOfAddProduct(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                ยืนยัน
              </button>
            </div>

          </div>
        </div>
      )}

      {/* (Modal แสดง Preview ข้อมูลสินค้าในตาราง) */}
      {showPreview && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="bg-white rounded-lg shadow border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              
              <div className="h-48 flex items-center justify-center bg-gray-100">
                <img 
                  src={`http://localhost:8080/${selectedProduct.imageUrl}`} 
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              
              <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500 h-10 overflow-hidden">{selectedProduct.description}</p>
                  
                  <div className="flex justify-between items-center my-3">
                    <span className="text-2xl font-bold text-blue-600">฿{selectedProduct.price.toLocaleString()}</span>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      คงเหลือ {selectedProduct.stock}
                    </span>
                  </div>
                  
              </div>

            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ปิด
              </button>
            
            </div>
          </div>
        </div>
      )}
      {/* (Modal สำหรับ Crop รูปภาพ) */}
      {showCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-white p-6 rounded-xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">ปรับรูปภาพ</h2>

            <div className="relative w-full h-64 bg-gray-200">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full mt-4"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {setShowCrop(false); setImageSrc(null);}}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                ยกเลิก
              </button>

              <button
                onClick={async () => {
                  const cropped = await getCroppedImg(
                    imageSrc,
                    croppedAreaPixels
                  );
                  setImageFile(cropped);
                  setShowCrop(false);
                  setImageSrc(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
      



    </div>
    
  );
}