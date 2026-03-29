"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, register } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const response = isRegister ? await register(email, password) : await login(email, password);

    setLoading(false);
    if (response.error) {
      setError(response.error);
      return;
    }

    router.push(APP_ROUTES.dashboard);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/70 p-6 space-y-4">
        <h1 className="text-2xl font-bold">{isRegister ? "Create account" : "Sign in"}</h1>

        <label className="block text-sm">
          <span className="text-slate-300">Email</span>
          <input
            type="email"
            className="w-full mt-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-300">Password</span>
          <input
            type="password"
            className="w-full mt-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={isRegister ? 8 : 1}
            required
            disabled={loading}
          />
        </label>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 py-2 font-semibold"
        >
          {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
        </button>

        <p className="text-sm text-slate-400">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="text-cyan-300 hover:underline" href={isRegister ? APP_ROUTES.login : APP_ROUTES.register}>
            {isRegister ? "Sign in" : "Register"}
          </Link>
        </p>
      </form>
    </div>
  );
}
