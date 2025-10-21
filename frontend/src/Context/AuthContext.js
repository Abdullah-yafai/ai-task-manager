import React, { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import api from "../utils/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(false);

  // ✅ Load user from localStorage once on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Invalid user in localStorage", err);
        localStorage.removeItem("user");
      }
    }
     setLoadingUser(false);
  }, []);

  // ✅ Handle login
  const login = async (email, password) => {
    setLoadingAuth(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data?.data || res.data;
      const { accessToken, user: loggedUser } = data;

      if (!accessToken) throw new Error("No token returned");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);

      toast.success("Login successful!");
      return loggedUser;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  };

  // ✅ Handle register
  const register = async (name, email, password) => {
    setLoadingAuth(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const data = res.data?.data || res.data;
      const { accessToken, user: newUser } = data;

      if (!accessToken) throw new Error("No token returned");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      toast.success("Account created successfully!");
      return newUser;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  };

  // ✅ Logout confirmation
  const logout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "You will be signed out from this device.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
    });

    if (!confirm.isConfirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loadingAuth,loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}
