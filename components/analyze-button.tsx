"use client";

import { useState } from "react";
import { analyzeDeductions, DeductionSuggestion } from "@/app/actions/analyze-deductions";
import { Sparkles } from "lucide-react";
import { DeductionSuggestions } from "./deduction-suggestions";

export function AnalyzeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<DeductionSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await analyzeDeductions();

      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        setError(result.error || "Failed to analyze deductions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <Sparkles className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
        {isLoading ? "Analyzing..." : "Analyze Deductions"}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {suggestions && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            AI Suggestions
          </h3>
          <DeductionSuggestions suggestions={suggestions} />
        </div>
      )}
    </div>
  );
}

