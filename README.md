# CPS714-Section3

This is the branch of team4, which will handle the financial side of FitHub - a billing dashboard for a fitness center with Stripe integration.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with your Stripe keys:
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- 💳 **Billing Overview** - Dashboard with current balance, next payment, and subscription status
- 📦 **Subscription Plans** - Browse and subscribe to Basic, Premium, and Elite plans
- 💳 **Payment Methods** - Manage payment methods and cards
- 📊 **Transaction History** - View detailed transaction history
- 🔒 **Stripe Integration** - Secure payment processing with Stripe Checkout

