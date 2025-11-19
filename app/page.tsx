import BillingDashboard from "@/components/BillingDashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="pt-16">
        <div className="container mx-auto px-6 py-8">
          <BillingDashboard />
        </div>
      </div>
    </main>
  );
}
