import React from 'react';
import './PaymentandBilling.css';

// This is just mock data for demonstration purposes
const billingData = {
  currentBalance: "$0.00",
  balanceStatus: "All payments up to date",
  nextPaymentAmount: "$49.99",
  nextPaymentDate: "Due Dec 10, 2025",
  activeSubscription: "Premium Plan",
  subscriptionType: "Monthly billing",
  totalPaid: "$549.89",
  totalTransactions: 11,
};


export default function PaymentAndBilling() {
  return (
    <div className="billing-container">
      <h2>Payment & Billing</h2>
      <p className="subtitle">Manage your payments, subscriptions, and billing history</p>
      
      <div className="card-layout">
        <div className="billing-card">
          <span className="card-title">Current Balance</span>
          <div className="card-main-value">{billingData.currentBalance}</div>
          <div className="card-sub-value">{billingData.balanceStatus}</div>
        </div>

        <div className="billing-card">
          <span className="card-title">Next Payment</span>
          <div className="card-main-value">{billingData.nextPaymentAmount}</div>
          <div className="card-sub-value">{billingData.nextPaymentDate}</div>
        </div>

        <div className="billing-card">
          <span className="card-title">Active Subscription</span>
          <div className="card-main-value">{billingData.activeSubscription}</div>
          <div className="card-sub-value">{billingData.subscriptionType}</div>
        </div>

        <div className="billing-card">
          <span className="card-title">Total Paid (2025)</span>
          <div className="card-main-value">{billingData.totalPaid}</div>
          <div className="card-sub-value">{billingData.totalTransactions} transactions</div>
        </div>
      </div>
    </div>
  );
}

