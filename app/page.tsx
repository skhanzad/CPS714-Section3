"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* 🎥 Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/gym-bg.mp4" type="video/mp4" />
      </video>

      {/* 🌑 Dark overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* 🏛️ Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 py-20 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl mx-auto space-y-8"
        >
          {/* ✨ Logo + Glow Fix */}
          <div className="relative flex justify-center items-center">
            {/* Soft golden glow behind logo */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-r from-[#D4AF37]/15 to-transparent blur-3xl"
            />

            <Image
              src="/images/fithub-logo.png"
              alt="FitHub Logo"
              width={220}
              height={220}
              priority
              unoptimized
              className="relative mx-auto object-contain mix-blend-lighten bg-transparent drop-shadow-[0_0_45px_rgba(212,175,55,0.6)]"
            />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Luxury Fitness <span className="text-[#D4AF37]">Redefined</span>
          </h1>

          <p className="max-w-xl mx-auto text-gray-300 text-base md:text-lg">
            Discover a gym experience crafted for performance & prestige.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-10 py-3 rounded-full shadow-xl hover:shadow-yellow-400/40 transition-all duration-300"
            >
              Join Now
            </Link>
            <Link
              href="/login"
              className="border border-yellow-400/70 bg-black/40 px-10 py-3 rounded-full text-yellow-300 hover:bg-black/60 transition-all duration-300"
            >
              Member Login
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 🪩 Compare Membership Plans */}
      <section className="relative z-10 bg-[#0A1128]/90 py-20">
        <h2 className="text-center text-4xl font-bold mb-4">
          Compare Membership Plans
        </h2>
        <p className="text-center text-gray-300 mb-10">
          Choose the plan that matches your goals. Upgrade anytime.
        </p>

        {/* Dynamic Comparison Table */}
        {(() => {
          const plans = [
            { key: "basic", name: "Basic", price: "$29 / mo" },
            { key: "premium", name: "Premium", price: "$59 / mo" },
            { key: "vip", name: "VIP", price: "$99 / mo" },
          ] as const;

          const features = [
            { label: "Gym Floor Access", basic: true, premium: true, vip: true },
            { label: "Locker Room & Showers", basic: true, premium: true, vip: true },
            { label: "Group Classes", basic: "2 / wk", premium: "Unlimited", vip: "Unlimited" },
            { label: "Guest Passes", basic: "1 / mo", premium: "3 / mo", vip: "Unlimited" },
            { label: "Personal Trainer Sessions", basic: false, premium: "1 / mo", vip: "2 / mo" },
            { label: "Priority Class Booking", basic: false, premium: true, vip: true },
            { label: "Towel Service", basic: false, premium: true, vip: true },
            { label: "Spa & Sauna Access", basic: false, premium: false, vip: true },
            { label: "Nutrition Consultation", basic: false, premium: false, vip: "Quarterly" },
            { label: "Lounge & Workspace Access", basic: false, premium: true, vip: true },
            { label: "24/7 Private Zone", basic: false, premium: false, vip: true },
            { label: "Early Access to Events", basic: false, premium: true, vip: true },
            { label: "Premium Support", basic: false, premium: true, vip: true },
          ];

          const Cell = ({
            value,
            highlight = false,
          }: {
            value: boolean | string;
            highlight?: boolean;
          }) => {
            if (value === true)
              return (
                <div
                  className={`mx-auto h-6 w-6 rounded-full grid place-items-center bg-emerald-500/90 text-black font-bold ${
                    highlight ? "ring-2 ring-yellow-400/60" : ""
                  }`}
                >
                  ✓
                </div>
              );
            if (value === false || value === "")
              return <div className="mx-auto text-gray-500">—</div>;
            return (
              <div
                className={`text-center ${
                  highlight ? "text-yellow-200 font-semibold" : "text-gray-200"
                }`}
              >
                {value}
              </div>
            );
          };

          return (
            <div className="max-w-6xl mx-auto px-4">
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left border-collapse">
                  {/* Header */}
                  <thead>
                    <tr className="text-sm uppercase tracking-wide text-gray-300">
                      <th className="py-5 pl-5 pr-4"></th>
                      {plans.map((p) => (
                        <th key={p.key} className="py-5 px-4 text-center">
                          <div className="text-xl font-semibold text-[#D4AF37]">{p.name}</div>
                          <div className="text-2xl font-bold text-white">{p.price}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    {features.map((f) => (
                      <tr key={f.label} className="border-t border-white/10">
                        <td className="py-4 pl-5 pr-4 text-gray-200">{f.label}</td>
                        <td className="py-4 px-4"><Cell value={(f as any).basic} /></td>
                        <td className="py-4 px-4"><Cell value={(f as any).premium} /></td>
                        <td className="py-4 px-4"><Cell value={(f as any).vip} highlight /></td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Footer CTAs */}
                  <tfoot>
                    <tr className="border-t border-white/10">
                      <td className="py-6 pl-5 pr-4"></td>
                      {plans.map((p) => (
                        <td key={p.key} className="py-6 px-4 text-center">
                          <Link
                            href={`/register?plan=${p.key}`}
                            className={`inline-block rounded-full px-8 py-3 font-semibold transition-all shadow-xl 
                              ${
                                p.key === "vip"
                                  ? "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black hover:shadow-yellow-400/40"
                                  : "border border-yellow-400/70 text-yellow-300 hover:bg-black/40"
                              }`}
                          >
                            Select {p.name}
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })()}
      </section>
    </main>
  );
}
