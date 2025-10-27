import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/global.css";
import "../styles/index.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // ✅ Auth pages (cinematic, no sidebar)
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-white font-inter overflow-hidden">
        {/* soft animated glow */}
        <div className="absolute top-1/2 left-1/2 w-[900px] h-[900px] bg-accent/20 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <main className="relative z-10 w-full max-w-2xl p-8">{children}</main>
      </div>
    );
  }

  // ✅ App pages (with sidebar)
  return (
    <div className="app-layout bg-[#0f1117] text-white min-h-screen flex">
      <Sidebar />
      <main className="main-content flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

