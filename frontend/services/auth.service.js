import api from "@/lib/api";

export const getMe = () => {
  return api.get("/api/v1/auth/me");
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

