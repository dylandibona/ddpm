"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CategoryGroup } from "@/app/actions/get-tax-prep-data";

interface CategoryGroupProps {
  group: CategoryGroup;
}

export function CategoryGroupCard({ group }: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <h3 className="text-lg font-semibold text-slate-900">
            {group.category}
          </h3>
          <span className="text-sm text-slate-600">
            ({group.transactionCount} transaction{group.transactionCount !== 1 ? "s" : ""})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-slate-900">
            {formatAmount(group.total)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="px-6 py-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Vendor</th>
                  <th className="pb-2">Property</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {group.transactions.map((tx) => (
                  <tr key={tx.id} className="text-sm">
                    <td className="py-2 text-slate-900">{formatDate(tx.date)}</td>
                    <td className="py-2 text-slate-900">
                      {tx.vendor || (
                        <span className="text-slate-400 italic">No vendor</span>
                      )}
                    </td>
                    <td className="py-2 text-slate-600">{tx.propertyName}</td>
                    <td className="py-2 text-right font-medium text-red-600">
                      {formatAmount(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

