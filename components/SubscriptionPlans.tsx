"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      name: "Basic",
      price: "$29.99",
      period: "month",
      features: [
        "Access to gym facilities",
        "Basic equipment usage",
        "Locker room access",
        "Free WiFi",
      ],
    },
    {
      name: "Premium",
      price: "$49.99",
      period: "month",
      features: [
        "Everything in Basic",
        "Personal trainer sessions (2/month)",
        "Premium equipment access",
        "Group fitness classes",
        "Nutrition consultation",
      ],
      popular: true,
      current: true,
    },
    {
      name: "Elite",
      price: "$79.99",
      period: "month",
      features: [
        "Everything in Premium",
        "Unlimited trainer sessions",
        "24/7 facility access",
        "All group classes included",
        "Priority booking",
        "Nutrition & meal planning",
      ],
    },
  ];

  const handleSubscribe = async (planName: string) => {
    if (selectedPlan || loading) return;
    
    setLoading(true);
    setSelectedPlan(planName);
    
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        toast.success("Redirecting to checkout...");
        window.location.href = url;
      } else if (sessionId) {
        toast.success("Checkout session created");
        // If using embedded checkout, you would handle it differently
        console.log("Checkout session created:", sessionId);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout. Please try again.");
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubscribe = (planName: string) => {
    setConfirmDialogOpen(null);
    handleSubscribe(planName);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-lg shadow-sm border-2 p-6 transition-all ease-out duration-200 hover:shadow-lg ${
              plan.popular
                ? "border-blue-500"
                : "border-gray-200"
            } ${plan.current ? "ring-2 ring-blue-200" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}

            {plan.current && (
              <div className="absolute -top-3 right-3">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center">
                <span className="text-4xl font-semibold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600 ml-2">
                  /{plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Dialog open={confirmDialogOpen === plan.name} onOpenChange={(open) => setConfirmDialogOpen(open ? plan.name : null)}>
              <DialogTrigger asChild>
                <button
                  disabled={plan.current || loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ease ${
                    plan.current
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : plan.popular
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  style={{
                    transitionDuration: "200ms",
                  }}
                >
                  {plan.current ? "Current Plan" : "Subscribe"}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Subscription</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to subscribe to the {plan.name} Plan for {plan.price}/{plan.period}?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <h4 className="font-medium text-gray-900 mb-2">Plan Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                    {plan.features.length > 3 && <li className="text-gray-500">...and more</li>}
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDialogOpen(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleConfirmSubscribe(plan.name)}
                    disabled={loading && selectedPlan === plan.name}
                  >
                    {loading && selectedPlan === plan.name ? "Processing..." : "Confirm Subscription"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
}
