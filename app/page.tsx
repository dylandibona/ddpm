import { TransactionsTable } from "@/components/transactions-table";
import { getDashboardData } from "@/app/actions/get-dashboard-data";
import { prisma } from "@/lib/prisma";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";

export default async function Home() {
  const result = await getDashboardData();

  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-destructive/50 rounded-xl p-6">
            <p className="text-destructive">Error loading dashboard: {result.error || "Unknown error"}</p>
          </div>
        </div>
      </main>
    );
  }

  const { totalIncomeYTD, totalExpensesYTD, recentTransactions } = result.data;
  const netIncome = totalIncomeYTD - totalExpensesYTD;
  const isPositive = netIncome >= 0;

  // Get properties for status
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      address: true,
      _count: {
        select: { statements: true }
      }
    }
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* Area A: Net Income (Top Left - Large) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-10 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Net Income YTD
                </p>
                <h2 className="text-6xl font-bold tracking-tighter mb-4" style={{ fontSize: '4rem', lineHeight: '1' }}>
                  <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                    ${Math.abs(netIncome).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Positive</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5 text-rose-400" />
                      <span className="text-sm font-medium text-rose-400">Negative</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Area B: Properties Status (Top Right) */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Properties</h3>
            </div>

            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    property._count.statements > 0 ? 'bg-emerald-400' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{property.address}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {property._count.statements > 0
                        ? `${property._count.statements} statement${property._count.statements !== 1 ? 's' : ''}`
                        : 'No statements'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Area C: Recent Activity (Bottom - Wide) */}
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
            {recentTransactions.length > 0 ? (
              <TransactionsTable transactions={recentTransactions} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recent transactions. Click "Sync" to import from Google Drive.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
