"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  type: string;
}

export default function TransactionHistory() {
  const [receiptDialogOpen, setReceiptDialogOpen] = useState<string | null>(null);

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
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Transaction History
        </h2>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ease" style={{ transitionDuration: "200ms" }}>
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors ease"
                  style={{ transitionDuration: "200ms" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
                    <Dialog open={receiptDialogOpen === transaction.id} onOpenChange={(open) => setReceiptDialogOpen(open ? transaction.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-900 p-0 h-auto">
                          View Receipt
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transaction Receipt</DialogTitle>
                          <DialogDescription>
                            Transaction details for {transaction.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                              <p className="text-sm text-gray-900">{transaction.id}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Date</p>
                              <p className="text-sm text-gray-900">{transaction.date}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Amount</p>
                              <p className="text-sm text-gray-900 font-semibold">{transaction.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Status</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-gray-600">Description</p>
                              <p className="text-sm text-gray-900">{transaction.description}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Type</p>
                              <p className="text-sm text-gray-900 capitalize">{transaction.type}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>Showing {transactions.length} transactions</p>
        <div className="flex space-x-2">
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors ease" style={{ transitionDuration: "200ms" }}>
            Previous
          </button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors ease" style={{ transitionDuration: "200ms" }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
