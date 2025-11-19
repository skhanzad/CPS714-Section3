"use client";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all ease-out duration-200 hover:shadow-md">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </p>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function BillingOverview() {
  // Mock data - in production, this would come from your API/Stripe
  const stats = [
    {
      title: "Current Balance",
      value: "$0.00",
      subtitle: "All payments up to date",
    },
    {
      title: "Next Payment",
      value: "$49.99",
      subtitle: "Due Dec 10, 2025",
    },
    {
      title: "Active Subscription",
      value: "Premium Plan",
      subtitle: "Monthly billing",
    },
    {
      title: "Total Paid (2025)",
      value: "$549.89",
      subtitle: "11 transactions",
      trend: { value: "+12%", isPositive: true },
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              date: "Dec 1, 2025",
              description: "Premium Plan payment",
              amount: "$49.99",
              status: "Completed",
            },
            {
              date: "Nov 1, 2025",
              description: "Premium Plan payment",
              amount: "$49.99",
              status: "Completed",
            },
            {
              date: "Oct 1, 2025",
              description: "Premium Plan payment",
              amount: "$49.99",
              status: "Completed",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.amount}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
