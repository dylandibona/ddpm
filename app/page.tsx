import { TransactionsTable } from "@/components/transactions-table";
import { getDashboardData } from "@/app/actions/get-dashboard-data";
import { TrendingUp, AlertCircle, FileText } from "lucide-react";

export default async function Home() {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-destructive/50 rounded-lg p-6">
            <p className="text-destructive">Error loading dashboard: {result.error || "Unknown error"}</p>
          </div>
        </div>
      </main>
    );
  }

  const { totalIncomeYTD, totalExpensesYTD, recentTransactions } = result.data;
  const netIncome = totalIncomeYTD - totalExpensesYTD;

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Net Income YTD (Top Left, Large) */}
          <div className="lg:col-span-2 lg:row-span-1 bg-card border border-border rounded-xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Net Income YTD
                </p>
                <h2 className="text-5xl font-bold text-foreground mt-2 tracking-tight">
                  ${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Income</p>
                <p className="text-xl font-semibold text-emerald-400 mt-1">
                  ${totalIncomeYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Expenses</p>
                <p className="text-xl font-semibold text-rose-400 mt-1">
                  ${totalExpensesYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Action Items (Top Right) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Action Items</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Sync Status</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recentTransactions.length > 0
                      ? `${recentTransactions.length} recent transactions`
                      : 'No transactions yet'}
                  </p>
                </div>
              </div>

              {recentTransactions.some(t => t.isFlagged) && (
                <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Flagged Items</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {recentTransactions.filter(t => t.isFlagged).length} transaction(s) need review
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Recent Transactions (Bottom, Wide) */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
            <TransactionsTable transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </main>
  );
}
