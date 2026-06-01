'use client';

// [Claude] หน้า Edit Product — โหลดข้อมูลสินค้าตาม id แล้วแสดงในฟอร์มให้แก้ไขได้

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { getProductById, updateProduct } from '@/services/auth.service';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  // ─── form states ──────────────────────────────────
  const [name, setName]             = useState('');
  const [price, setPrice]           = useState('');
  const [stock, setStock]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState('BREAD');
  const [expiryDate, setExpiryDate] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // รูปเดิมจาก server

  // ─── image crop states ────────────────────────────
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc]               = useState(null);
  const [imageFile, setImageFile]             = useState(null);
  const [showCrop, setShowCrop]               = useState(false);
  const [crop, setCrop]                       = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                       = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [loading, setLoading] = useState(true);

  // [Claude] โหลดข้อมูลสินค้าจาก backend แล้วใส่ลงฟอร์ม
  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then((res) => {
        const p = res.data;
        setName(p.name || '');
        setPrice(p.price || '');
        setStock(p.stock || '');
        setDescription(p.description || '');
        setCategory(p.category || 'BREAD');
        setExpiryDate(p.expiryDate || '');
        setCurrentImageUrl(p.imageUrl || null);
      })
      .catch(() => toast.error('โหลดข้อมูลสินค้าไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, [id]);

  // ─── image crop ───────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImageSrc(reader.result); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  const getCroppedImg = (src, cropPx) =>
    new Promise((resolve) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = cropPx.width;
        canvas.height = cropPx.height;
        canvas.getContext('2d').drawImage(image, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, cropPx.width, cropPx.height);
        canvas.toBlob((blob) => resolve(new File([blob], 'cropped.jpeg', { type: 'image/jpeg' })), 'image/jpeg');
      };
    });

  // [Claude] บันทึกการแก้ไข — ส่ง formData ไปที่ PUT /api/v1/admin/products/{id}
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      toast.error('กรุณากรอก ชื่อ, ราคา, และจำนวน');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('expiryDate', expiryDate);
    if (imageFile) formData.append('image', imageFile); // ส่งรูปใหม่เฉพาะเมื่อมีการเปลี่ยน

    try {
      await updateProduct(id, formData);
      toast.success('แก้ไขสินค้าสำเร็จ');
      router.push('/admin/products');
    } catch {
      toast.error('แก้ไขสินค้าไม่สำเร็จ');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="bg-[#EEF4FB] rounded-lg p-6 md:p-8">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
        <p className="text-gray-500">แก้ไขข้อมูลสินค้า ID: {id}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) *</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนคงเหลือ *</label>
              <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10">
                <option value="BREAD">Bread</option>
                <option value="CAKE">Cake</option>
                <option value="COOKIE">Cookie</option>
                <option value="DRINK">Drink</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันปิดรับ order</label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* รูปภาพ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพ</label>
              <div className="flex items-center gap-3">
                {/* แสดงรูปปัจจุบัน หรือรูปที่ crop ใหม่ */}
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} alt="new" className="w-14 h-14 object-cover rounded-md border" />
                ) : currentImageUrl ? (
                  <img src={`http://localhost:8080/${currentImageUrl}`} alt="current" className="w-14 h-14 object-cover rounded-md border" />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-md border flex items-center justify-center text-gray-300 text-xs">No img</div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
              {imageFile && <p className="text-xs text-blue-500 mt-1">มีรูปใหม่ที่จะอัปเดต</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.push('/admin/products')}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              ยกเลิก
            </button>
            <button type="submit"
              className="px-5 py-2 bg-[#0F2235] text-white rounded-lg hover:bg-blue-600 transition">
              บันทึก
            </button>
          </div>
        </form>
      </div>

      {/* Modal Crop รูปภาพ */}
      {showCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">ปรับรูปภาพ</h2>
            <div className="relative w-full h-64 bg-gray-200">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1}
                onCropChange={setCrop} onZoomChange={setZoom}
                onCropComplete={(_, px) => setCroppedAreaPixels(px)} />
            </div>
            <input type="range" min={1} max={3} step={0.1} value={zoom}
              onChange={e => setZoom(e.target.value)} className="w-full mt-4" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowCrop(false); setImageSrc(null); fileInputRef.current.value = ''; }}
                className="px-4 py-2 bg-gray-300 rounded">ยกเลิก</button>
              <button onClick={async () => {
                  const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
                  setImageFile(cropped);
                  setShowCrop(false);
                  setImageSrc(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded">ตกลง</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
