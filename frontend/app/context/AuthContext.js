"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const AuthContext = createContext(null);

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
];

export const AuthProvider = ({ children }) => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ ถ้าเป็นหน้า public → ข้ามเลย
    if (PUBLIC_PATHS.includes(pathname)) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
          return null;
        }
        return res.json();
      })
      .then(data => data && setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
