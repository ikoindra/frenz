"use client";

import { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);  useEffect(() => {
    // Check if this is from login for faster navigation
    const fromLogin = sessionStorage.getItem("fromLogin");
    const userRole = localStorage.getItem("userRole");
    
    // Extra speed boost for supervisor login
    const isSupervisorLogin = fromLogin && userRole === "supervisor";
    
    const progressIncrement = fromLogin ? (isSupervisorLogin ? 20 : 15) : 8; // Even faster for supervisor
    const updateInterval = fromLogin ? (isSupervisorLogin ? 15 : 20) : 30; // Even faster updates for supervisor
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Very quick delay before hiding splash screen
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              // Clear the login flag
              if (fromLogin) {
                sessionStorage.removeItem("fromLogin");
              }
              onComplete();
            }, fromLogin ? (isSupervisorLogin ? 75 : 100) : 200); // Even faster for supervisor
          }, fromLogin ? (isSupervisorLogin ? 25 : 50) : 100); // Much faster for supervisor
          return 100;
        }
        return prev + progressIncrement;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Decorations - Similar to login page */}
      <div className="absolute w-full h-full overflow-hidden">
        <div 
          className="absolute rounded-full w-[941px] h-[800px] -left-[225px] -top-[117px]"
          style={{
            backgroundImage: "linear-gradient(to bottom, #0E1C1D 0%, #264E50 38%, #336669 56%, #3F7F82 75%)",
          }}
        />
        <div 
          className="absolute rounded-full w-[398px] h-[400px] -left-[77px] top-[553px]"
          style={{
            backgroundImage: "linear-gradient(to bottom, #0E1C1D 0%, #264E50 38%, #336669 56%, #3F7F82 75%)",
          }}
        />
        <div 
          className="absolute rounded-full w-[283px] h-[280px] left-[419px] top-[454px]"
          style={{
            backgroundImage: "linear-gradient(to bottom, #0E1C1D 0%, #264E50 38%, #336669 56%, #3F7F82 75%)",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white shadow-2xl flex items-center justify-center mb-6 animate-pulse">
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-[#3F7F83] to-[#2B5658] flex items-center justify-center text-white text-2xl lg:text-3xl font-bold">
              F
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-8">
          <h1 className="font-poppins text-4xl lg:text-6xl font-bold text-[#3F7F83] tracking-wide animate-bounce">
            FRENZ
          </h1>
          <p className="font-poppins text-lg lg:text-2xl text-[#2B5658] mt-2 tracking-wide">
            Indonesia
          </p>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <p className="font-poppins text-lg text-gray-600 animate-pulse">
            Loading...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 lg:w-80 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#3F7F83] to-[#2B5658] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="mt-4">
          <p className="font-poppins text-sm text-gray-500">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Tagline */}
        <div className="mt-8">
          <p className="font-poppins text-sm lg:text-base text-gray-600 max-w-md">
            Sistem Manajemen Karyawan dan Inventori
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
