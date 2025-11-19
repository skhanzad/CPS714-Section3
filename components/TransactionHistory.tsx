"use client";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  type: string;
}

export default function TransactionHistory() {
  const transactions: Transaction[] = [
    {
      id: "txn_001",
      date: "Dec 1, 2025",
      description: "Premium Plan - Monthly Subscription",
      amount: "$49.99",
      status: "Completed",
      type: "subscription",
    },
    {
      id: "txn_002",
      date: "Nov 1, 2025",
      description: "Premium Plan - Monthly Subscription",
      amount: "$49.99",
      status: "Completed",
      type: "subscription",
    },
    {
      id: "txn_003",
      date: "Oct 1, 2025",
      description: "Premium Plan - Monthly Subscription",
      amount: "$49.99",
      status: "Completed",
      type: "subscription",
    },
    {
      id: "txn_004",
      date: "Sep 15, 2025",
      description: "Personal Training Session",
      amount: "$75.00",
      status: "Completed",
      type: "one-time",
    },
    {
      id: "txn_005",
      date: "Sep 1, 2025",
      description: "Premium Plan - Monthly Subscription",
      amount: "$49.99",
      status: "Completed",
      type: "subscription",
    },
    {
      id: "txn_006",
      date: "Aug 1, 2025",
      description: "Premium Plan - Monthly Subscription",
      amount: "$49.99",
      status: "Completed",
      type: "subscription",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Transaction History
        </h2>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ease dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" style={{ transitionDuration: "200ms" }}>
          Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ease"
                  style={{ transitionDuration: "200ms" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 transition-colors ease dark:text-blue-400 dark:hover:text-blue-300" style={{ transitionDuration: "200ms" }}>
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <p>Showing {transactions.length} transactions</p>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ease" style={{ transitionDuration: "200ms" }}>
            Previous
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ease" style={{ transitionDuration: "200ms" }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
