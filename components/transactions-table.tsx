"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string | null;
  vendor: string | null;
  isFlagged: boolean;
  flagReason: string | null;
  propertyName: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-900 uppercase tracking-wider w-12">
                {/* Flag icon column */}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map((tx) => {
              const isFlagged = tx.isFlagged;
              const isHovered = hoveredRow === tx.id;

              return (
                <tr
                  key={tx.id}
                  className={`transition-colors ${
                    isFlagged
                      ? "bg-purple-50/50 hover:bg-purple-100/70"
                      : "hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setHoveredRow(tx.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {tx.vendor || (
                      <span className="text-slate-400 italic">No vendor</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {tx.category || (
                      <span className="text-slate-400 italic">Uncategorized</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {tx.propertyName}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      tx.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatAmount(tx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {isFlagged && (
                      <div className="relative inline-block">
                        <AlertCircle className="w-5 h-5 text-purple-700" />
                        {isHovered && tx.flagReason && (
                          <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap max-w-xs">
                            {tx.flagReason}
                            <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

