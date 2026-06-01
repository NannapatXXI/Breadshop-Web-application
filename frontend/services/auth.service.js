import api from "@/lib/api";

export const getMe = () => {
  return api.get("/api/v1/auth/me");
};
export const profile = () => {
  return api.get("/api/v1/auth/profile");
};
export const login = (credentials) => {
  return api.post("/api/v1/auth/login", credentials);
};

export const register = (data) => {
  return api.post("/api/v1/auth/register", data);
};

export const sendOTPEmail = (email) => {
  return api.post("/api/v1/auth/send-OTP-mail",email);
};
export const verifyOTP = (data) => {
  return api.post("/api/v1/auth/verify-otp", data);
};
export const resetPassword = (data) => {
  return api.post("/api/v1/auth/reset-password", data);
};

/** รายการสินค้าสำหรับลูกค้า (login แล้วใครก็ได้) */
export const getProducts = () => {
  return api.get("/api/v1/products");
};

/** รายการสินค้าสำหรับ admin เท่านั้น */
export const getAdminProducts = () => {
  return api.get("/api/v1/admin/products");
};

/** @deprecated ใช้ getProducts หรือ getAdminProducts แทน */
export const getproduct = getAdminProducts;

export const getorders = () => {
  return api.get("/api/v1/admin/orders");
};



// [Claude] ดึงสินค้าตาม id สำหรับหน้า edit
export const getProductById = (id) => {
  return api.get(`/api/v1/admin/get-product-by-id/${id}`);
};

// [Claude] อัปเดตสินค้าตาม id
export const updateProduct = (id, formData) => {
  return api.put(`/api/v1/admin/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const addproduct = (formData) => {
  return api.post("/api/v1/admin/add-products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

