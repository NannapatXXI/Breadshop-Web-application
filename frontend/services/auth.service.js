import api from "@/lib/api";

export const getMe = () => {
  return api.get("/api/v1/auth/me");
};
