"use client";

import { useState } from "react";
import BillingOverview from "./BillingOverview";
import PaymentMethods from "./PaymentMethods";
import SubscriptionPlans from "./SubscriptionPlans";
import TransactionHistory from "./TransactionHistory";

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "methods" | "history">("overview");

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">
          Billing Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your payments, subscriptions, and billing history
        </p>
      </header>

      <nav className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "plans", label: "Plans" },
            { id: "methods", label: "Payment Methods" },
            { id: "history", label: "Transaction History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ease ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
              style={{
                transitionDuration: "200ms",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-8">
        {activeTab === "overview" && <BillingOverview />}
        {activeTab === "plans" && <SubscriptionPlans />}
        {activeTab === "methods" && <PaymentMethods />}
        {activeTab === "history" && <TransactionHistory />}
      </div>
    </div>
  );
}
