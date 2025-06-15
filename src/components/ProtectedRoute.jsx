"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("userRole");

        if (!token) {
          console.log("No token found, redirecting to login");
          router.push("/login");
          return;
        }

        // If a specific role is required, check it
        if (requiredRole && userRole !== requiredRole.toLowerCase()) {
          console.log(`Role mismatch: required ${requiredRole}, found ${userRole}`);
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3F7F83] to-[#2B5658] flex items-center justify-center text-white text-xl font-bold animate-spin mb-4">
            <i className="ti ti-loader text-2xl"></i>
          </div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router.push will handle the redirect
  }

  return children;
};

export default ProtectedRoute;
