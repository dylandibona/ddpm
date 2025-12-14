import { getDashboardData } from "@/app/actions/get-dashboard-data";
import { syncGoogleDrive } from "@/app/actions/sync-drive";
import { RefreshCw } from "lucide-react";

export default async function Home() {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6">
            <p className="text-destructive font-mono text-sm">
              Error: {result.error || "Unknown error"}
            </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-fr">

          {/* Area 1: Net Income YTD (Top Left, 2/3 width) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-8 flex flex-col justify-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Net Income YTD
            </p>
            <h2 className="text-5xl font-mono font-bold tracking-tight">
              <span className={netIncome >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {netIncome >= 0 ? "+" : "-"}${Math.abs(netIncome).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </h2>
            <div className="mt-4 flex gap-6 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">Income:</span>{" "}
                <span className="text-emerald-400">+${totalIncomeYTD.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Expenses:</span>{" "}
                <span className="text-rose-400">-${totalExpensesYTD.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Area 2: Sync Status (Top Right, 1/3 width) */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Sync Status
              </p>
              <p className="text-sm text-muted-foreground">
                Last sync: Recent
              </p>
            </div>
            <form action={syncGoogleDrive} className="mt-4">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </button>
            </form>
          </div>

          {/* Area 3: Property Ledger (Bottom, Full Width) */}
          <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wider mb-6">
              Property Ledger
            </h3>
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Property</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vendor</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">{tx.propertyName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{tx.category || "—"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{tx.vendor || "—"}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${
                          tx.amount >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {tx.amount >= 0 ? "+" : "-"}${Math.abs(tx.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm font-mono">
                  No transactions found. Click "Sync Now" to import from Google Drive.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
