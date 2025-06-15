"use client";

import { useState, useEffect } from "react";

function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300); // Reduced delay
          return 100;
        }
        return prev + 4; // Faster progress
      });
    }, 40); // Faster interval

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3F7F83] to-[#2B5658] flex items-center justify-center text-white text-3xl font-bold mx-auto animate-pulse">
            F
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-[#3F7F83] mb-2">FRENZ</h1>
        <p className="text-lg text-[#2B5658] mb-8">Indonesia</p>
        
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mb-4">
          <div 
            className="h-full bg-gradient-to-r from-[#3F7F83] to-[#2B5658] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

export default SplashScreen;
