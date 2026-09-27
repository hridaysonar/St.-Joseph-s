"use client";

import React, { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo.jsx";
export const SplashScreen = ({ onFinish }) => {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    // 1-second display timer as required by specification
    const timer = setTimeout(() => {
      setFade(true);
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 350);
      return () => clearTimeout(finishTimer);
    }, 1100);
    return () => clearTimeout(timer);
  }, [onFinish]);
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-8 select-none transition-opacity duration-300 ${fade ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <div className="w-full"></div>

      {/* Center Branding */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <BrandLogo size={112} priority />
          <div className="absolute -inset-1 rounded-3xl bg-indigo-500/20 blur-xl -z-10 animate-pulse"></div>
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
            Student Life
          </h1>
          <p className="text-sm font-medium text-indigo-300/80 mt-1 tracking-wider uppercase">
            Plan • Study • Excel
          </p>
        </div>
      </div>

      {/* Bottom small branding - ONLY on splash screen per specification */}
      <div className="w-full text-center pb-4 animate-in fade-in duration-700">
        <p className="text-xs font-medium tracking-widest text-slate-400/90 uppercase">
          by Nahid
        </p>
      </div>
    </div>
  );
};
