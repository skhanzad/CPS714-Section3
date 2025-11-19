"use client";

import { useState } from "react";

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      brand: "mastercard",
      last4: "5555",
      expMonth: 6,
      expYear: 2026,
      isDefault: false,
    },
  ]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleRemove = (id: string) => {
    if (paymentMethods.find((m) => m.id === id)?.isDefault && paymentMethods.length > 1) {
      const otherMethod = paymentMethods.find((m) => m.id !== id);
      if (otherMethod) {
        setPaymentMethods([
          ...paymentMethods.filter((method) => method.id !== id),
          { ...otherMethod, isDefault: true },
        ]);
      }
    } else {
      setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const icons: Record<string, string> = {
      visa: "💳",
      mastercard: "💳",
      amex: "💳",
      discover: "💳",
    };
    return icons[brand] || "💳";
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Payment Methods
        </h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors ease dark:bg-blue-600 dark:hover:bg-blue-700" style={{ transitionDuration: "200ms" }}>
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getCardBrandIcon(method.brand)}</div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                    {method.brand} •••• {method.last4}
                  </p>
                  {method.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expires {method.expMonth.toString().padStart(2, "0")}/{method.expYear}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {!method.isDefault && (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ease dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  style={{ transitionDuration: "200ms" }}
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleRemove(method.id)}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors ease dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                style={{ transitionDuration: "200ms" }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {paymentMethods.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No payment methods added yet
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors ease dark:bg-blue-600 dark:hover:bg-blue-700" style={{ transitionDuration: "200ms" }}>
              Add Payment Method
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
