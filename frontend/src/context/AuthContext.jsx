import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi load trang
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        // Tránh gọi API profile gây lỗi 401 nếu chưa có token (khách vãng lai)
        if (!token || token === "null" || token === "undefined") {
          setUser(null);
          localStorage.removeItem("user");
          setLoading(false);
          return;
        }

        const response = await authAPI.getProfile();
        if (response.data.success) {
          setUser(response.data.data);
          localStorage.setItem("user", JSON.stringify(response.data.data));
        } else {
          // Nếu API trả về success: false, mới xóa user
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // CHỈ xóa user nếu lỗi là 401 (hết hạn/không hợp lệ)
        // Nếu là lỗi mạng hoặc lỗi server 500, tạm thời giữ lại user từ localStorage để tránh logout nhầm
        if (error.response && error.response.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const updateUser = (userData) => {
    const newUser = { ...user, ...userData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
