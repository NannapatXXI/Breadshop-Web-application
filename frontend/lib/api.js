import axios from "axios"; //ใช้สำหรับ:ดัก 401 ,refresh token ,retry request

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ส่ง cookie ไป backend
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    try {
      // 🔁 เรียก backend refresh
      await api.post("/api/v1/auth/refresh");

      // 🔁 retry request เดิม
      return api(originalRequest);
    } catch (e) {
      // refresh พัง → logout
      window.location.href = "/login";
      return Promise.reject(e);
    }
  }
);

export default api;
