"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

type ProfileRow = {
  full_name: string | null;
  address: string | null;
  contact_number: string | null;
  emergency_contact: string | null;
  goals: string[] | null;
  created_at: string | null;
};

type MembershipRow = {
  tier: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string | null;
};

export default function DashboardPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [membership, setMembership] = useState<MembershipRow | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data: sessionResult } = await supabase.auth.getSession();
        const session = sessionResult.session;
        if (!session) {
          router.replace("/login");
          return;
        }
        if (!isMounted) return;

        setUserEmail(session.user.email ?? "");

        const { data: profileRow, error: profileError } = await supabase
          .from("profiles")
          .select("full_name,address,contact_number,emergency_contact,goals,created_at")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        const { data: membershipRow, error: membershipError } = await supabase
          .from("memberships")
          .select("tier,status,current_period_start,current_period_end,created_at")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (membershipError && membershipError.code !== "PGRST116") {
          throw membershipError;
        }

        if (!isMounted) return;
        setProfile(profileRow ?? null);
        setMembership(membershipRow ?? null);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Failed to load dashboard.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const renderGoals = () => {
    if (!profile?.goals || profile.goals.length === 0) {
      return <span className="text-gray-400">No goals selected yet.</span>;
    }
    return (
      <ul className="flex flex-wrap gap-2">
        {profile.goals.map((goal) => (
          <li
            key={goal}
            className="rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 px-3 py-1 text-xs uppercase tracking-wide"
          >
            {goal}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050B1E] via-[#0A1128] to-[#1B2847] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.2),_transparent_55%)]" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
            </h1>
            <p className="text-gray-300 mt-2">
              You&apos;re signed in as <span className="text-yellow-300">{userEmail}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-full border border-yellow-400/60 px-4 py-2 text-sm text-yellow-200 hover:bg-yellow-400/10 transition"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-4 py-2 text-sm shadow-lg hover:shadow-yellow-400/40 transition"
            >
              Sign out
            </button>
          </div>
        </header>

        {loading && (
          <div className="grid place-items-center py-20 text-gray-300">
            <div className="animate-spin h-10 w-10 border-4 border-yellow-400/40 border-t-transparent rounded-full" />
            <p className="mt-4">Preparing your dashboard…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-[#D4AF37] mb-4">Member Profile</h2>
              <dl className="space-y-4 text-sm text-gray-200">
                <div>
                  <dt className="uppercase text-xs tracking-widest text-gray-400">Full Name</dt>
                  <dd className="text-lg font-medium text-white">
                    {profile?.full_name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase text-xs tracking-widest text-gray-400">Address</dt>
                  <dd>{profile?.address || "Not provided"}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="uppercase text-xs tracking-widest text-gray-400">
                      Contact Number
                    </dt>
                    <dd>{profile?.contact_number || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="uppercase text-xs tracking-widest text-gray-400">
                      Emergency Contact
                    </dt>
                    <dd>{profile?.emergency_contact || "Not provided"}</dd>
                  </div>
                </div>
                <div>
                  <dt className="uppercase text-xs tracking-widest text-gray-400">
                    Fitness Goals
                  </dt>
                  <dd className="mt-2">{renderGoals()}</dd>
                </div>
              </dl>
            </section>

            <aside className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 backdrop-blur-xl p-8 shadow-xl flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-yellow-200">Membership</h2>
                <p className="text-sm text-yellow-100/80">Your current plan details</p>
              </div>

              {membership ? (
                <div className="space-y-4 text-sm text-yellow-100/90">
                  <div>
                    <p className="uppercase text-xs tracking-[0.4em] text-yellow-200/70">
                      Tier
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {membership.tier.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase text-xs tracking-[0.4em] text-yellow-200/70">
                      Status
                    </p>
                    <p className="text-lg font-semibold capitalize">{membership.status}</p>
                  </div>
                  <div className="border-t border-yellow-200/20 pt-4 text-xs space-y-2">
                    <p>
                      <span className="font-semibold">Current period start:</span>{" "}
                      {membership.current_period_start
                        ? new Date(membership.current_period_start).toLocaleDateString()
                        : "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Current period end:</span>{" "}
                      {membership.current_period_end
                        ? new Date(membership.current_period_end).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-yellow-100/70">
                  Membership details aren&apos;t configured yet. Once you choose a tier during
                  onboarding it will appear here.
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}



