"use client";

import { useState, useEffect } from "react";

const DashboardSplashScreen = ({ onComplete, userRole = "admin" }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const roleMessages = {
    admin: "Memuat Dashboard Admin...",
    employee: "Memuat Dashboard Employee...",
    supervisor: "Memuat Dashboard Supervisor..."
  };

  const roleColors = {
    admin: "from-red-500 to-red-700",
    employee: "from-blue-500 to-blue-700", 
    supervisor: "from-green-500 to-green-700"
  };
  useEffect(() => {
    // Faster loading for supervisor role
    const progressIncrement = userRole === "supervisor" ? 15 : 10;
    const updateInterval = userRole === "supervisor" ? 30 : 40;
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {        if (prev >= 100) {
          clearInterval(interval);
          // Very quick delay before hiding splash screen
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onComplete();
            }, userRole === "supervisor" ? 100 : 150);
          }, userRole === "supervisor" ? 75 : 100);
          return 100;
        }
        return prev + progressIncrement; // Faster loading based on role
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [onComplete, userRole]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90 transition-opacity duration-300 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative z-10 flex flex-col items-center justify-center text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3F7F83] to-[#2B5658] flex items-center justify-center text-white text-xl font-bold animate-spin-slow">
            <i className="ti ti-dashboard text-2xl"></i>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-6">
          <h1 className="font-poppins text-2xl font-bold text-[#3F7F83]">
            FRENZ
          </h1>
          <p className="font-poppins text-sm text-[#2B5658] capitalize">
            {userRole} Dashboard
          </p>
        </div>

        {/* Loading Message */}
        <div className="mb-6">
          <p className="font-poppins text-base text-gray-700">
            {roleMessages[userRole] || "Memuat Dashboard..."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full bg-gradient-to-r ${roleColors[userRole] || "from-[#3F7F83] to-[#2B5658]"} transition-all duration-300 ease-out rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div>
          <p className="font-poppins text-sm text-gray-500">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DashboardSplashScreen;
