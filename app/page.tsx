import { SyncButton } from "@/components/sync-button";
import { SummaryCard } from "@/components/summary-card";
import { TransactionsTable } from "@/components/transactions-table";
import { getDashboardData } from "@/app/actions/get-dashboard-data";
import { Navigation } from "@/components/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";

export default async function Home() {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    return (
      <main className="flex min-h-screen flex-col p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">DDPM</h1>
              <p className="mt-2 text-lg text-slate-600">
                Property Management Dashboard
              </p>
            </div>
            <SyncButton />
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-6 text-red-600">
            <p>Error loading dashboard: {result.error || "Unknown error"}</p>
          </div>
        </div>
      </main>
    );
  }

  const { totalIncomeYTD, totalExpensesYTD, recentTransactions } = result.data;

  return (
    <main className="flex min-h-screen flex-col p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">DDPM</h1>
            <p className="mt-2 text-lg text-slate-600">
              Property Management Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Navigation />
            <SyncButton />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SummaryCard
            title="Total Income YTD"
            amount={totalIncomeYTD}
            icon={
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            }
          />
          <SummaryCard
            title="Total Expenses YTD"
            amount={totalExpensesYTD}
            icon={
              <div className="p-3 bg-slate-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-slate-900" />
              </div>
            }
          />
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Recent Transactions
          </h2>
          <TransactionsTable transactions={recentTransactions} />
        </div>
      </div>
    </main>
  );
}
