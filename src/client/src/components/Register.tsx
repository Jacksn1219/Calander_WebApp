"use client";

import "../styles/global.css";
import "../styles/login-page.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // 🧭 Redirect to /home if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/home");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register" && password !== confirm)
      return setError("Passwords do not match.");

    const endpoint =
      mode === "login"
        ? "http://localhost:5000/auth/login"
        : "http://localhost:5000/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          mode === "login"
            ? JSON.stringify({ email, password })
            : JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
      }

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user || { email }));

      setSuccess(
        `${mode === "login" ? "Login" : "Registration"} successful!`
      );
      setTimeout(() => navigate("/home"), 500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="app-layout bg-[#f7f9fc] min-h-screen flex flex-col items-center justify-center">
      <main className="main-content flex flex-col items-center justify-center w-full">
        <h2 className="text-4xl font-bold mb-6 text-[#0b1220] font-bebas uppercase tracking-wide">
          Calendar
        </h2>

        {/* === Toggle Buttons === */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-4 text-xl font-semibold rounded-2xl border border-[#1f6feb] text-[#1f6feb] hover:bg-[#1f6feb]/10 hover:scale-105 transition-all duration-300"
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className="px-10 py-4 text-xl font-semibold rounded-2xl bg-[#1f6feb] text-white shadow-md hover:scale-105 transition-all duration-300"
          >
            Register
          </button>
        </div>

        {/* === Form Section === */}
        <div className="login-card shadow-xl rounded-2xl p-10 bg-white max-w-md w-full">
          <form onSubmit={handleSubmit} className="login-form text-left">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f6feb] focus:outline-none"
            />

            <label className="block text-sm font-medium text-gray-600 mb-1 mt-3">
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

            <label className="block text-sm font-medium text-gray-600 mb-1 mt-3">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                Register
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
