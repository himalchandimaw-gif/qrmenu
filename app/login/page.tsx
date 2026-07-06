"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  Utensils,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      router.push("/admin");
    }
  }

  async function login() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 p-4 text-white">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-yellow-400/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden min-h-[650px] flex-col justify-between bg-gradient-to-br from-orange-700 via-gray-900 to-black p-10 md:flex"
        >
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 shadow-xl backdrop-blur">
              <Utensils className="h-8 w-8" />
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight">
              Manage your <br />
              <span className="text-orange-300">QR Menu</span> easily.
            </h1>

            <p className="mt-5 max-w-md text-lg text-white/70">
              Update food items, prices, categories, photos and availability
              anytime from one beautiful dashboard.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">Live</p>
              <p className="text-sm text-white/60">Price edit</p>
            </div>

            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">QR</p>
              <p className="text-sm text-white/60">Menu link</p>
            </div>

            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">Fast</p>
              <p className="text-sm text-white/60">Updates</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="flex min-h-[650px] items-center justify-center bg-white p-6 text-gray-900 md:p-10"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-700">
                <LockKeyhole className="h-10 w-10" />
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
                <Sparkles className="h-4 w-4" />
                Restaurant Admin Panel
              </div>

              <h2 className="mt-5 text-4xl font-black">Welcome Back</h2>

              <p className="mt-2 text-gray-500">
                Login to manage your digital QR menu.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    placeholder="admin@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") login();
                    }}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 outline-none transition focus:border-orange-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={login}
                disabled={loading}
                className="mt-3 w-full rounded-2xl bg-orange-700 py-4 font-black text-white shadow-lg shadow-orange-700/30 transition hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>
            </div>

            <div className="mt-8 rounded-3xl bg-gray-50 p-5 text-center">
              <p className="text-sm font-semibold text-gray-500">
                QR Menu System
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Secure admin access for restaurant menu management.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}