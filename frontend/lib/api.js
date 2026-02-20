import axios from "axios"; //ใช้สำหรับ:ดัก 401 ,refresh token ,retry request
import Router from "next/router";

// สร้าง axios instance ที่ตั้งค่าเริ่มต้น
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ส่ง cookie ไป backend
});


api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;
  
      if (
        ![401, 403].includes(err.response?.status) ||
        originalRequest._retry
      ) {
        return Promise.reject(err);
      }
  
      // ป้องกัน infinite loop
      if (originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(err);
      }
  
      originalRequest._retry = true;
  
      try {
        await api.post("/api/v1/auth/refresh");
  
        console.log("Token refreshed successfully");
  
        return api(originalRequest);
      } catch (e) {
        Router.push("/login");
        return Promise.reject(e);
      }
    }
  );
  

export default api;
