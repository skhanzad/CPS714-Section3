"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

export default function CancelPage() {
  useEffect(() => {
    toast.error("Payment was canceled");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Payment Canceled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was canceled. No charges have been made.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors ease"
          style={{ transitionDuration: "200ms" }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
