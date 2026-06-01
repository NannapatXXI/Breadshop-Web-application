'use client';

// [Claude] หน้าประวัติคำสั่งซื้อ — แสดงรายการ order ทั้งหมดของ user พร้อม status และรายการสินค้า

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '@/lib/api';

// [Claude] แปลง status เป็นภาษาไทยพร้อม style สี
const statusConfig = {
  PENDING:    { label: 'รอดำเนินการ', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  CONFIRMED:  { label: 'ยืนยันแล้ว',  bg: 'bg-blue-100',   text: 'text-blue-800'   },
  PROCESSING: { label: 'กำลังเตรียม', bg: 'bg-purple-100', text: 'text-purple-800' },
  SHIPPED:    { label: 'จัดส่งแล้ว',  bg: 'bg-blue-100',   text: 'text-blue-800'   },
  DELIVERED:  { label: 'สำเร็จ',      bg: 'bg-green-100',  text: 'text-green-800'  },
  CANCELLED:  { label: 'ยกเลิก',      bg: 'bg-red-100',    text: 'text-red-800'    },
  REFUNDED:   { label: 'คืนเงิน',     bg: 'bg-pink-100',   text: 'text-pink-800'   },
};

const getStatus = (status) =>
  statusConfig[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // [Claude] track ว่า order ไหนกำลัง expand

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  // [Claude] ดึง order ทั้งหมดของ user จาก backend
  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/orders?userId=${user.id}`);
      // เรียงล่าสุดก่อน
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch {
      // ไม่แสดง error ที่ซับซ้อน แค่ทำให้ list ว่าง
    } finally {
      setFetchLoading(false);
    }
  };

  // [Claude] toggle expand/collapse รายการสินค้าใน order
  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading || fetchLoading) {
    return <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-800">ประวัติคำสั่งซื้อ</h1>

      {orders.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">
          ยังไม่มีคำสั่งซื้อ
        </div>
      )}

      {orders.map((order) => {
        const s = getStatus(order.status);
        const isOpen = expandedId === order.id;

        return (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* ─── Header ของแต่ละ order ─── */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-800">#{order.orderNo}</span>
                <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.bg} ${s.text}`}>
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  ฿{Number(order.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
                {/* [Claude] ลูกศรบอก expand state */}
                <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </div>
            </div>

            {/* ─── รายละเอียดเมื่อ expand ─── */}
            {isOpen && (
              <div className="border-t border-gray-100 px-6 py-4">

                {/* ที่อยู่จัดส่ง */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">ที่อยู่จัดส่ง</p>
                  <p className="text-sm text-gray-700">
                    {order.shippingName} · {order.shippingPhone}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.shippingAddress} {order.shippingSubdistrict} {order.shippingDistrict} {order.shippingProvince} {order.shippingPostcode}
                  </p>
                </div>

                {/* รายการสินค้า */}
                <p className="text-xs text-gray-400 font-medium mb-2">รายการสินค้า</p>
                <div className="flex flex-col gap-2 mb-4">
                  {order.orderLines?.map((line) => (
                    <div key={line.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        {line.productName}
                        <span className="text-gray-400 ml-1">× {line.quantity}</span>
                      </span>
                      <span className="text-gray-700 font-medium">
                        ฿{Number(line.totalPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* สรุปราคา */}
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>ราคาสินค้า</span>
                    <span>฿{Number(order.subtotal).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>ส่วนลด {order.promotionCode && `(${order.promotionCode})`}</span>
                      <span>-฿{Number(order.discountAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>ค่าจัดส่ง</span>
                    <span>฿{Number(order.shippingFee).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800 pt-1 border-t border-gray-100">
                    <span>รวมทั้งหมด</span>
                    <span>฿{Number(order.totalAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* tracking */}
                {order.trackingNo && (
                  <p className="text-xs text-gray-400 mt-3">
                    Tracking: <span className="text-gray-600 font-medium">{order.trackingNo}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
