'use client';

// [Claude] หน้า Profile — แสดง/แก้ไขข้อมูลส่วนตัว และจัดการที่อยู่จัดส่ง
// รองรับการเลือกที่อยู่จากแผนที่ผ่าน MapPicker (Leaflet + OpenStreetMap)

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../context/AuthContext';
import api from '@/lib/api';

// [Claude] dynamic import เพราะ Leaflet ใช้ window ซึ่งไม่มีใน SSR
const MapPicker = dynamic(() => import('../../components/MapPicker'), { ssr: false });

export default function ProfilePage() {
  const { user, loading } = useAuth();

  // ─── ข้อมูลส่วนตัว ────────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [username, setUsername]             = useState('');
  const [profileMsg, setProfileMsg]         = useState('');

  // ─── ที่อยู่ ──────────────────────────────────────────────────
  const [addresses, setAddresses]           = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressMsg, setAddressMsg]         = useState('');
  const [showMap, setShowMap]               = useState(false); // [Claude] เปิด/ปิด modal แผนที่

  // ฟอร์มที่อยู่ (ใช้ทั้ง เพิ่ม และ แก้ไข)
  const emptyForm = {
    name: '', recipientName: '', phone: '',
    address: '', province: '', district: '',
    subdistrict: '', postcode: '', isDefault: false,
  };
  const [form, setForm] = useState(emptyForm);

  // ─── โหลดข้อมูลเริ่มต้น ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setUsername(user.username || '');
    fetchAddresses();
  }, [user]);

  // [Claude] ดึงรายการที่อยู่ของ user จาก backend
  const fetchAddresses = async () => {
    try {
      const res = await api.get(`/api/users/${user.id}/addresses`);
      setAddresses(res.data);
    } catch {
      setAddressMsg('โหลดที่อยู่ไม่สำเร็จ');
    }
  };

  // ─── แก้ไขข้อมูลส่วนตัว ──────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      await api.put('/api/v1/auth/me', { username });
      setProfileMsg('บันทึกสำเร็จ');
      setEditingProfile(false);
    } catch {
      setProfileMsg('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
    setTimeout(() => setProfileMsg(''), 3000);
  };

  // ─── จัดการฟอร์มที่อยู่ ──────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // [Claude] เปิดฟอร์มเพิ่มที่อยู่ใหม่
  const openAddForm = () => {
    setForm(emptyForm);
    setEditingAddressId(null);
    setShowAddressForm(true);
  };

  // [Claude] เปิดฟอร์มแก้ไขที่อยู่ที่มีอยู่แล้ว
  const openEditForm = (addr) => {
    setForm({
      name:          addr.name          || '',
      recipientName: addr.recipientName || '',
      phone:         addr.phone         || '',
      address:       addr.address       || '',
      province:      addr.province      || '',
      district:      addr.district      || '',
      subdistrict:   addr.subdistrict   || '',
      postcode:      addr.postcode      || '',
      isDefault:     addr.isDefault     || false,
    });
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  // [Claude] รับค่าที่อยู่จาก MapPicker แล้วกรอกลงฟอร์ม
  // spread โดยตรง ไม่ใช้ || fallback เพื่อให้ค่าที่ map ดึงมา override ฟอร์มเสมอ
  // (name/recipientName/phone ไม่ถูกแตะเพราะ addressData ไม่มี key พวกนั้น)
  const handleMapConfirm = (addressData) => {
    setForm(prev => ({ ...prev, ...addressData }));
    setShowMap(false);
  };

  // [Claude] บันทึกที่อยู่ — ถ้ามี editingAddressId คือแก้ไข, ไม่มีคือเพิ่มใหม่
  const handleSaveAddress = async () => {
    try {
      if (editingAddressId) {
        await api.put(`/api/users/${user.id}/addresses/${editingAddressId}`, form);
      } else {
        await api.post(`/api/users/${user.id}/addresses`, form);
      }
      setAddressMsg('บันทึกที่อยู่สำเร็จ');
      setShowAddressForm(false);
      setEditingAddressId(null);
      fetchAddresses();
    } catch {
      setAddressMsg('บันทึกที่อยู่ไม่สำเร็จ');
    }
    setTimeout(() => setAddressMsg(''), 3000);
  };

  // [Claude] ลบที่อยู่
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('ต้องการลบที่อยู่นี้?')) return;
    try {
      await api.delete(`/api/users/${user.id}/addresses/${addressId}`);
      setAddressMsg('ลบที่อยู่สำเร็จ');
      fetchAddresses();
    } catch {
      setAddressMsg('ลบไม่สำเร็จ');
    }
    setTimeout(() => setAddressMsg(''), 3000);
  };

  // [Claude] ตั้ง default ที่อยู่
  const handleSetDefault = async (addressId) => {
    try {
      await api.put(`/api/users/${user.id}/addresses/${addressId}/default`);
      fetchAddresses();
    } catch {
      setAddressMsg('ตั้งค่าไม่สำเร็จ');
      setTimeout(() => setAddressMsg(''), 3000);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* ─── ส่วนที่ 1: ข้อมูลส่วนตัว ─── */}
      <section className="bg-white rounded-2xl shadow-sm p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg transition-colors"
            >
              แก้ไข
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1 font-medium">ชื่อผู้ใช้</p>
          {editingProfile ? (
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : (
            <p className="text-sm text-gray-800">{username}</p>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1 font-medium">อีเมล</p>
          <p className="text-sm text-gray-800">{user?.email}</p>
        </div>

        {editingProfile && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSaveProfile}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg transition-colors"
            >
              บันทึก
            </button>
            <button
              onClick={() => { setEditingProfile(false); setUsername(user?.username || ''); }}
              className="border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        )}

        {profileMsg && <p className="text-sm text-indigo-500 mt-3">{profileMsg}</p>}
      </section>

      {/* ─── ส่วนที่ 2: ที่อยู่จัดส่ง ─── */}
      <section className="bg-white rounded-2xl shadow-sm p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">ที่อยู่จัดส่ง</h2>
          <button
            onClick={openAddForm}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg transition-colors"
          >
            + เพิ่มที่อยู่
          </button>
        </div>

        {addressMsg && <p className="text-sm text-indigo-500 mb-3">{addressMsg}</p>}

        {addresses.length === 0 && !showAddressForm && (
          <p className="text-sm text-gray-400 text-center py-5">
            ยังไม่มีที่อยู่ กด &quot;+ เพิ่มที่อยู่&quot; เพื่อเพิ่มเลยครับ
          </p>
        )}

        {/* รายการที่อยู่ */}
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border rounded-xl p-4 transition-colors ${
                addr.isDefault ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm">{addr.name}</span>
                {addr.isDefault && (
                  <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                    default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{addr.recipientName} · {addr.phone}</p>
              <p className="text-xs text-gray-500">
                {addr.address} {addr.subdistrict} {addr.district} {addr.province} {addr.postcode}
              </p>
              <div className="flex gap-3 mt-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-indigo-500 hover:underline"
                  >
                    ตั้งเป็น default
                  </button>
                )}
                <button
                  onClick={() => openEditForm(addr)}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ─── ฟอร์มเพิ่ม/แก้ไขที่อยู่ ─── */}
        {showAddressForm && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                {editingAddressId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
              </h3>
              {/* [Claude] ปุ่มเปิด MapPicker */}
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-lg transition-colors border border-indigo-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                เลือกจากแผนที่
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: 'ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)', name: 'name' },
                { label: 'ชื่อผู้รับ', name: 'recipientName' },
                { label: 'เบอร์โทรศัพท์', name: 'phone' },
                { label: 'ที่อยู่', name: 'address' },
                { label: 'ตำบล / แขวง', name: 'subdistrict' },
                { label: 'อำเภอ / เขต', name: 'district' },
                { label: 'จังหวัด', name: 'province' },
                { label: 'รหัสไปรษณีย์', name: 'postcode' },
              ].map(({ label, name }) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">{label}</label>
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    name={name}
                    value={form[name]}
                    onChange={handleFormChange}
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleFormChange}
              />
              ตั้งเป็นที่อยู่หลัก
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleSaveAddress}
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg transition-colors"
              >
                บันทึก
              </button>
              <button
                onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                className="border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </section>

      {/* [Claude] MapPicker modal — render เฉพาะเมื่อ showMap=true */}
      {showMap && (
        <MapPicker
          onConfirm={handleMapConfirm}
          onClose={() => setShowMap(false)}
        />
      )}

    </div>
  );
}
