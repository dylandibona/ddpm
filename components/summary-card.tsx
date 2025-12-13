import { DollarSign } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon?: React.ReactNode;
}

export function SummaryCard({ title, amount, icon }: SummaryCardProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {formattedAmount}
          </p>
        </div>
        {icon || (
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-900" />
          </div>
        )}
      </div>
    </div>
  );
}

