"use client";

// [Claude] SalesChart — รับ period prop แล้วดึงข้อมูลจริงจาก backend มาแสดง

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";

export default function SalesChart({ period }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // แปลง button state (A/B/C) → query param ที่ backend รับ
    const periodMap = { A: "week", B: "month", C: "year" };
    const p = periodMap[period] || "week";

    api.get(`/api/v1/admin/dashboard/sales?period=${p}`)
      .then((res) => setData(res.data.data))
      .catch(() => setData([]));
  }, [period]);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v) => `฿${Number(v).toLocaleString('th-TH')}`} />
          <Legend />
          <Bar dataKey="previous" fill="#94a3b8" name="ช่วงก่อนหน้า" animationDuration={1200} />
          <Bar dataKey="current"  fill="#3b82f6" name="ช่วงนี้"       animationDuration={1200} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
