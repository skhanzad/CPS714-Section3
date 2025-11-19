// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FitHub — Member Portal",
  description: "Luxury fitness onboarding for Peak Performance Gym",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-[#0A1128] text-white`}>
        {children}
      </body>
    </html>
  );
}
