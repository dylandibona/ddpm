"use client";

import { AlertCircle, DollarSign } from "lucide-react";
import { DeductionSuggestion } from "@/app/actions/analyze-deductions";

interface DeductionSuggestionsProps {
  suggestions: DeductionSuggestion[];
}

export function DeductionSuggestions({
  suggestions,
}: DeductionSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <p className="text-slate-600 text-center">
          No suggestions at this time. Your deductions look good!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-lg p-6"
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-lg ${
                suggestion.type === "capitalization"
                  ? "bg-purple-50"
                  : "bg-blue-50"
              }`}
            >
              {suggestion.type === "capitalization" ? (
                <DollarSign className="w-5 h-5 text-purple-700" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-700" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {suggestion.title}
              </h3>
              {suggestion.category && (
                <p className="text-sm text-slate-600 mb-2">
                  Category: {suggestion.category}
                </p>
              )}
              <p className="text-slate-700">{suggestion.description}</p>
              {suggestion.amount && (
                <p className="text-sm font-medium text-slate-900 mt-2">
                  Amount:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(suggestion.amount)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

