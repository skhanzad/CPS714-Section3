"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getSupabaseClient, assertSupabaseConfigured } from "@/lib/supabaseClient";
import { ensureProfileAndMembership } from "@/lib/onboarding";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* 🏠 Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition-all z-20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/login-luxury.mp4" type="video/mp4" />
      </video>

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white/10 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-10"
        >
          {/* logo */}
          <div className="flex justify-center mb-6 relative">
            <div className="absolute w-[140px] h-[140px] bg-yellow-400/10 blur-3xl rounded-full animate-pulse" />
            <Image
              src="/images/fithub-logo.png"
              alt="FitHub Logo"
              width={100}
              height={100}
              priority
              className="relative object-contain mix-blend-screen bg-transparent drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome Back to <span className="text-[#D4AF37]">FitHub</span>
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Sign in to continue your fitness journey.
          </p>

          {/* form */}
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                assertSupabaseConfigured();
                const supabase = getSupabaseClient();
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });
                if (signInError) {
                  setError(signInError.message);
                  return;
                }
                const user = data.user;
                if (!user) {
                  setError("Login succeeded, but user info was not returned.");
                  return;
                }

                await ensureProfileAndMembership({ supabase, user });
                router.push("/dashboard");
                return;
              } catch (err: any) {
                setError(err?.message ?? "Failed to login");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 pr-12 outline-none focus:border-[#D4AF37]/70"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#D4AF37]"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-4 py-3 shadow-xl hover:shadow-yellow-400/40 transition-all disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="text-[#D4AF37] hover:underline font-medium"
            >
              Create one
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
