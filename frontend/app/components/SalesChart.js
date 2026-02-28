"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Week 1", lastMonth: 4000, thisMonth: 5200 },
  { name: "Week 2", lastMonth: 3000, thisMonth: 4100 },
  { name: "Week 3", lastMonth: 2000, thisMonth: 3800 },
  { name: "Week 4", lastMonth: 2780, thisMonth: 4600 },
];

export default function MonthlyComparisonChart() {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
  
            <Bar
              dataKey="lastMonth"
              fill="#94a3b8"
              name="Last Month"
              animationDuration={1200}
            />
  
            <Bar
              dataKey="thisMonth"
              fill="#3b82f6"
              name="This Month"
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }