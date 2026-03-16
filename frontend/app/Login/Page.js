"use client";

import { useState } from "react";
import { login } from "@/services/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const result = await login(email, password);

      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.user.role);

      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border p-6">
        <h1 className="text-2xl font-semibold">Login</h1>

        <input
          className="w-full rounded-xl border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          type="password"
          className="w-full rounded-xl border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="rounded-xl bg-blue-600 px-4 py-2 text-white">
          Login
        </button>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}
      </form>
    </main>
  );
}
