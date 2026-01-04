"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      // Always verify with server first (don't trust localStorage)
      const res = await fetch("/api/auth/current-user", {
        credentials: "include", // Important for cookies
        cache: "no-store", // Don't cache this request
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      });
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // Server says no user - clear everything
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // On error, clear user state
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name || "User"}!`);
        return { success: true, user: data.user };
      }

      throw new Error("No user data received");
    } catch (error) {
      toast.error(error.message || "Login failed");
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Clear user state immediately (UI update)
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.clear();

      // Call logout API to clear cookie - WAIT for it to complete
      try {
        const res = await fetch("/api/auth/logout", { 
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
        
        if (!res.ok) {
          console.error("Logout API returned error:", res.status);
        }
      } catch (err) {
        console.error("Logout API error:", err);
      }

      // Ensure user state is cleared
      setUser(null);
      
      // Force a hard page reload to clear all cached state and cookies
      // This ensures mobile browsers properly clear everything
      window.location.href = "/";
      
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if anything fails
      setUser(null);
      localStorage.clear();
      // Force redirect to home with hard refresh
      window.location.href = "/";
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isWriterOrAdmin = () => {
    return user && (user.role === "writer" || user.role === "admin");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    fetchUser,
    isAuthenticated,
    isWriterOrAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}





