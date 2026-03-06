"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "เบเกอรี่", value: 33728 },
  { name: "เค้ก", value: 23610 },
  { name: "ขนมปัง", value: 16864 },
  { name: "โดนัท", value: 10118 },
];

const COLORS = ["#1E3A8A", "#3B82F6", "#60A5FA", "#BFDBFE"];

const total = data.reduce((sum, item) => sum + item.value, 0);

export default function CategoryDonutChart() {
  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between ">
      
      {/* วงกลม */}
      <div className="w-[280px] h-[280px] relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              cornerRadius={10}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* ตัวเลขตรงกลาง */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold">100%</h1>
          <p className="text-gray-400 text-sm">รวม</p>
        </div>
      </div>

      {/* Legend + ราคา */}
      <div className="space-y-4 w-full md:w-1/2 mt-6 md:mt-0">
        {data.map((item, index) => {
          const percent = ((item.value / total) * 100).toFixed(0);

          return (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-md"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-gray-600 font-medium">
                  {item.name}
                </span>
              </div>

              <div className="text-right">
                <p className="font-bold">
                  ฿{item.value.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">
                  {percent}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}