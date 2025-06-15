"use client";

import { useState, useEffect } from "react";
import DashboardSplashScreen from "@/components/DashboardSplashScreen";

const DashboardWrapper = ({ children, userRole = "admin" }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication immediately
    const token = localStorage.getItem("token");
    if (!token) {
      // No token, redirect to login
      window.location.href = "/login";
      return;
    }

    setIsAuthenticated(true);

    // Check if user came from login or direct access
    const fromLogin = sessionStorage.getItem("fromLogin");
    if (!fromLogin) {
      setShowSplash(false);
    } else {
      sessionStorage.removeItem("fromLogin");
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Don't render anything until authentication is verified
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {showSplash && (
        <DashboardSplashScreen 
          onComplete={handleSplashComplete}
          userRole={userRole}
        />
      )}
      {children}
    </>
  );
};

export default DashboardWrapper;
