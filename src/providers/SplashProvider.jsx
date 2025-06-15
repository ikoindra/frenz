"use client";

import { createContext, useContext, useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";

const SplashContext = createContext();

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error("useSplash must be used within a SplashProvider");
  }
  return context;
};

export const SplashProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Check if this is the first load
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsFirstLoad(false);
    }
  }, []);

  const hideSplash = () => {
    setShowSplash(false);
    if (isFirstLoad) {
      setIsFirstLoad(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }
  };

  const showSplashScreen = () => {
    setShowSplash(true);
    setIsFirstLoad(false); // Not first load anymore
  };  return (
    <SplashContext.Provider value={{ showSplash, hideSplash, showSplashScreen, isFirstLoad }}>
      {showSplash && <SplashScreen onComplete={hideSplash} />}
      {children}
    </SplashContext.Provider>
  );
};
