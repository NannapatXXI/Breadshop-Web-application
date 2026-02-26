// app/(app)/home/product/page.js
'use client'; 

// 1. Import เครื่องมือที่จำเป็น
import { useState,useRef } from 'react';
import { useCart } from '../../CartContext'; 
import { useEffect } from 'react';
import toast from 'react-hot-toast'; // (เราจะใช้ toast แจ้งเตือน)
import { FaSearch,FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { TiArchive } from "react-icons/ti";
import { FiAlertTriangle } from "react-icons/fi";
import { MdOutlineSell } from "react-icons/md";
import { TiDeleteOutline } from "react-icons/ti";

import { getproduct,addproduct } from "@/services/auth.service";
import Cropper from "react-easy-crop";
import { useRouter } from "next/navigation";





// (เริ่ม Component - เหมือนเดิม)
export default function ProductPage() {

  // (States ทั้งหมด - เหมือนเดิม)
  const router = useRouter();

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
  
  const [search, setSearch] = useState('');
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
  
  const boxMap = {
    "CAKE": (
      <div className="p-4 bg-blue-200 border rounded-lg shadow-md transition duration-150">
        CAKE 
      </div>
    ),
    "BREAD": (
      <div className="p-4 bg-green-100 border rounded-lg shadow-md transition duration-150">
        BREAD 
      </div>
    ),
    "COOKIE": (
      <div className="p-4 bg-yellow-100 border rounded-lg shadow-md transition duration-150">
        COOKIE 
      </div>
    )
  };

  const renderStockBox = (stock) => {
    if (stock >= 10) {
      return <div className="px-3 py-1 bg-green-100 text-green-700 rounded-md">พร้อมขาย</div>;
    } 
    else if (stock >= 5) {
      return <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md">เหลือปานกลาง</div>;
    } 
    else if (stock > 0) {
      return <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md">ใกล้หมด</div>;
    } 
    else {
      return <div className="px-3 py-1 bg-red-100 text-red-700 rounded-md">หมด</div>;
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
      <div className="mb-6  flex rounded-lg">

        <div className="w-4/5 p-4  ">
          <h2 className="text-2xl font-bold text-gray-800">Product</h2>
          <p className="text-gray-500">จัดการสินค้าของคุณ</p>
        </div>

        <div className="w-1/2 p-4 flex justify-end rounded-lg ">
            <button  onClick={() => router.push("/admin/products/addproduct")} className="px-4 py-2  h-10 bg-[#0F2235] text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition duration-150">
              + add Product
              </button>
         
        </div>

      </div>

      {/* (ส่วนแสดงสถิติสินค้า) */}
      <div  className='grid grid-cols-4 gap-2 mb-2  text-gray-500 font-medium h-32'>
          <div className="bg-white flex items-center justify-left pl-10 rounded-md">
            <div className="h-10 flex items-center justify-center">
               <div className='bg-[#EEF4FB] p-4 rounded-md flex items-center justify-center'>
                 <TiArchive  size={30} className="text-blue-600" />
                </div>
                <div className = 'flex flex-col items-start justify-center ml-3'>
                        <h1> ....</h1>
                        <p >สินค้าทั้งหมด</p>
                      
                 </div>
                 
            </div>
            
          </div>
        
          <div className="bg-white flex items-center justify-left pl-10 rounded-md">
            <div className="h-10 flex items-center justify-center">
              
                <div className='bg-[#c6e9c6] p-4 rounded-md flex items-center justify-center text-white'>
                    <MdOutlineSell size={30} className="text-green-600" />
                  </div>
                  <div className = 'flex flex-col items-start justify-center ml-3'>
                        <h1> ....</h1>
                        <p >พร้อมขาย</p>
                      
                 </div>
            </div>
            
          </div>
          <div className="bg-white flex items-center justify-left pl-10 rounded-md">
            <div className="h-10 flex items-center justify-center">
                 <div className='bg-[#fff4b4] p-4 rounded-md flex items-center justify-center text-white'>
                 <FiAlertTriangle  size={30} className="text-yellow-800"/>
                  </div>
                  <div className = 'flex flex-col items-start justify-center ml-3'>
                        <h1> ....</h1>
                        <p >สต็อกใกล้หมด</p>
                      
                 </div>
            </div>
            
          </div>
          <div className="bg-white flex items-center justify-left pl-10 rounded-md">
            <div className="h-10 flex items-center justify-center">
                  <div className='bg-[#e4c9c9] p-4 rounded-md flex items-center justify-center text-white'>
                  <TiDeleteOutline  size={30} className="text-red-800"/>
                  </div>
                  <div className = 'flex flex-col items-start justify-center ml-3'>
                        <h1> ....  </h1>
                        <p >หมดสต็อก</p>
                      
                 </div>
            </div>
            
          </div>
      </div>

      <div className="flex items-center justify-between  gap-4 mb-6  bg-white  shadow-md p-2 rounded-lg">
            
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
            <div className="inline-flex p-1 rounded-lg ">
              
              <div className = "grid grid-cols-[10px_150px_150px_150_150px] w-1000 gap-2 "> 
                    <div className=' text-2xl text-gray-400 flex items-center justify-center'> 
                          |
                        </div>
                      <button  className={`px-4 py-2 rounded-md font-semibold transition-all bg-[#0F2235] text-white  flex items-center justify-center  `}>
                       ทั้งหมด
                    </button>
                 
                
                  
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

    
           
    
            
          </div>

    
      {/* (table ) */}
      <div className="bg-white  rounded-xl ">
  
        <table className="min-w-full table-fixed border  border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-[#0F2235]  text-white">
            <tr>
              <th className="px-4 py-3  text-center text-sm  font-semibold">
               id
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold ">
               name
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                price
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                stock
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                description
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                category
              </th>
              <th className="px-6 py-3   text-center text-sm font-semibold">
                status
              </th>
              <th className="px-6 py-3   text-center text-sm font-semibold">
                expiryDate
              </th>
              
              
              <th className=" py-3 text-center text-sm font-semibold">
                Image 
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                Functions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
          {products.map((product,index) => (

            console.log("สินค้า",product),

            <tr key={product.id} className="border-t  text-center  hover:bg-gray-50">
              <td className="px-4 py-2">{index + 1}</td> 
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.price}</td>
              <td className="px-4 py-2">{product.stock}</td>
              <td className="px-4 py-2">{product.description}</td>
              <td className="px-4 py-2">{boxMap[product.category] || (<div className="p-4 bg-gray-100 border">  ไม่พบค่า</div>)}</td>
              <td className="px-4 py-2">{renderStockBox(product.stock) || (<div className="p-4 bg-gray-100 border">  ไม่พบค่า</div>)}</td>
              
              <td className="px-4 py-2">{product.expiryDate}</td>
              <td className="px-3 py-2"><img
                src={`http://localhost:8080/${product.imageUrl}`}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-md border"
                
              /></td>
              <td className="px-4 py-2 ">
                <div className="flex justify-center gap-2">
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
                </div>
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