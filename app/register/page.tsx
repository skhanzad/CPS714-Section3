"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient, assertSupabaseConfigured } from "@/lib/supabaseClient";
import { ensureProfileAndMembership } from "@/lib/onboarding";

const fitnessGoals = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Endurance",
  "Mobility",
  "Flexibility",
  "Cardio Health",
  "Posture Correction",
  "Core Stability",
  "Stress Relief",
  "Rehabilitation",
  "General Wellness",
  "Functional Training",
  "Bodybuilding",
  "CrossFit",
  "Pilates",
  "Yoga",
  "HIIT",
  "Zumba",
  "Powerlifting",
  "Injury Recovery",
  "Balance Improvement",
  "Marathon Prep",
  "Mind-Body Connection",
  "Athletic Conditioning",
  "Dance Fitness",
  "Prenatal Fitness",
  "Senior Wellness",
  "Postnatal Recovery",
  "Self-Defense",
  "Boxing",
  "Cycling",
  "Rowing",
  "Group Training",
  "Nutrition Focus",
];

const tiers = [
  {
    name: "Basic",
    price: "$29 / mo",
    tagline: "Essential access to the full gym experience.",
  },
  {
    name: "Premium",
    price: "$59 / mo",
    tagline: "Personalized training and unlimited group sessions.",
  },
  {
    name: "VIP",
    price: "$99 / mo",
    tagline: "Elite privileges with 24/7 access and luxury benefits.",
  },
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [tier, setTier] = useState(planParam || "");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : prev.length < 5
        ? [...prev, goal]
        : prev
    );
  }

  const strength =
    password.length === 0
      ? ""
      : password.length < 6
      ? "Weak"
      : /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
      ? "Strong"
      : "Medium";

  return (
    <main className="grid md:grid-cols-2 min-h-screen text-white relative">
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

      {/* left background video */}
      <div className="relative hidden md:block">
        <video
          src="/videos/register-luxury.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* right side form */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-12 bg-[#0A1128] relative">
        <div className="max-w-lg w-full mx-auto bg-white/10 border border-white/10 p-8 rounded-2xl backdrop-blur-lg shadow-2xl">
          <h1 className="text-3xl font-bold mb-2">
            Join <span className="text-[#D4AF37]">FitHub</span>
          </h1>
          <p className="text-gray-300 mb-6">
            Create your personalized luxury membership account
          </p>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSuccess(null);
              if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
              }
              if (!tier) {
                setError("Please select a membership tier.");
                return;
              }
              setLoading(true);
              try {
                assertSupabaseConfigured();
                const supabase = getSupabaseClient();
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: {
                      full_name: fullName,
                      address,
                      contact_number: contactNumber,
                      emergency_contact: emergencyContact,
                      goals: selectedGoals,
                      membership_tier: tier,
                    },
                  },
                });
                if (signUpError) {
                  setError(signUpError.message);
                  setLoading(false);
                  return;
                }
                const user = signUpData.user;
                if (!user) {
                  setError("Sign up succeeded, but no user returned.");
                  setLoading(false);
                  return;
                }
                const formData = {
                  fullName,
                  address,
                  contactNumber,
                  emergencyContact,
                  goals: selectedGoals,
                  tier,
                };

                let session = signUpData.session;
                if (!session) {
                  // Try immediate sign-in (works when email confirmations are disabled)
                  const {
                    data: signInData,
                    error: signInError,
                  } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });

                  if (signInError || !signInData.session) {
                    setSuccess(
                      "Account created! Please verify your email, then log in to finish onboarding."
                    );
                    return;
                  }
                  session = signInData.session;
                }

                if (!session) {
                  setSuccess(
                    "Account created! Please verify your email, then log in to finish onboarding."
                  );
                  return;
                }

                await ensureProfileAndMembership({
                  supabase,
                  user: session.user,
                  formData,
                });

                setSuccess("Account created! Redirecting to your dashboard…");
                router.push("/dashboard");
              } catch (err: any) {
                setError(err?.message ?? "Registration failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            {/* Basic info */}
            <input
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
            />
            <input
              placeholder="Address (Line 1, City, Province)"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
            />
            <input
              placeholder="Contact Number"
              required
              pattern="[0-9]{10}"
              title="10-digit phone number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
            />
            <input
              placeholder="Emergency Contact Number"
              required
              pattern="[0-9]{10}"
              title="10-digit phone number"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
            />

            {/* password fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
                />
                {strength && (
                  <p
                    className={`text-xs mt-1 ${
                      strength === "Strong"
                        ? "text-green-400"
                        : strength === "Medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    Strength: {strength}
                  </p>
                )}
              </div>
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-[#0F1424] border border-white/10 px-4 py-3 outline-none focus:border-[#D4AF37]/70"
              />
            </div>

            {/* fitness goals */}
            <div>
              <label className="block mb-2 text-sm text-gray-300">
                Select up to 5 Fitness Goals
              </label>
              <div className="h-36 overflow-y-auto rounded-lg border border-white/10 bg-[#0F1424] p-3 grid grid-cols-2 gap-2">
                {fitnessGoals.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`text-sm rounded-full px-3 py-1 border transition ${
                      selectedGoals.includes(goal)
                        ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                        : "border-white/20 text-gray-300 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* membership tier simplified */}
            <div>
              <label className="block mb-3 text-sm text-gray-300">
                Choose Your Membership Tier
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((t) => (
                  <button
                    type="button"
                    key={t.name}
                    onClick={() => setTier(t.name)}
                    className={`flex flex-col justify-between text-center rounded-xl p-6 border transition-all hover:scale-[1.03] ${
                      tier === t.name
                        ? "border-[#D4AF37] bg-gradient-to-r from-yellow-700/20 to-yellow-400/10 shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                        : "border-white/10 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-[#D4AF37] mb-2">
                      {t.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-100">{t.price}</p>
                    <p className="text-xs text-gray-400 mt-2">{t.tagline}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-400">{success}</p>}

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-4 py-3 shadow-xl hover:shadow-yellow-500/40 transition-all disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
