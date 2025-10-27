"use client";

import "../styles/global.css";
import "../styles/login-page.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/home");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user || { email }));

      setSuccess("Login successful!");
      setTimeout(() => navigate("/home"), 700);
    } catch (err: any) {
      setError(err.message || "Network error");
    }
  };

  return (
    <div className="app-layout bg-[#f7f9fc] min-h-screen flex flex-col items-center justify-center">
      <main className="main-content flex flex-col items-center justify-center w-full">
        {/* === Title === */}
        <h2 className="text-4xl font-bold mb-6 text-[#0b1220] font-bebas uppercase tracking-wide">
          Calendar
        </h2>

        {/* === Toggle Buttons === */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className="px-10 py-4 text-xl font-semibold rounded-2xl bg-[#1f6feb] text-white shadow-md hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 text-xl font-semibold rounded-2xl border border-[#1f6feb] text-[#1f6feb] hover:bg-[#1f6feb]/10 hover:scale-105 transition-all duration-300"
          >
            Register
          </button>
        </div>

        {/* === Form Section === */}
        <div className="login-card shadow-xl rounded-2xl p-10 bg-white max-w-md w-full">
          <form onSubmit={handleSubmit} className="login-form text-left">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f6feb] focus:outline-none"
            />

            <label className="block text-sm font-medium text-gray-600 mb-1 mt-3">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f6feb] focus:outline-none"
            />

            {error && (
              <div className="form-error mt-3 bg-red-50 text-red-700 px-3 py-2 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 px-3 py-2 rounded mt-3">
                {success}
              </div>
            )}

            <div className="form-actions mt-6">
              <button
                type="submit"
                className="primary w-full py-3 text-lg rounded-lg bg-[#1f6feb] text-white font-semibold hover:bg-[#174cbf] transition-all duration-300"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
