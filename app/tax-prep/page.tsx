import { getTaxPrepData } from "@/app/actions/get-tax-prep-data";
import { CategoryGroupCard } from "@/components/category-group";
import { AnalyzeButton } from "@/components/analyze-button";
import { SummaryCard } from "@/components/summary-card";
import { Navigation } from "@/components/navigation";
import { FileText } from "lucide-react";

export default async function TaxPrepPage() {
  const result = await getTaxPrepData();

  if (!result.success || !result.data) {
    return (
      <main className="flex min-h-screen flex-col p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Tax Prep</h1>
            <p className="mt-2 text-lg text-slate-600">
              Schedule E Deduction Summary
            </p>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-6 text-red-600">
            <p>Error loading tax prep data: {result.error || "Unknown error"}</p>
          </div>
        </div>
      </main>
    );
  }

  const { categoryGroups, totalDeductions, year } = result.data;

  return (
    <main className="flex min-h-screen flex-col p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Tax Prep</h1>
            <p className="mt-2 text-lg text-slate-600">
              Schedule E Deduction Summary for {year}
            </p>
          </div>
          <Navigation />
        </div>

        {/* Total Deductions Card */}
        <div className="mb-8">
          <SummaryCard
            title="Total Deductions YTD"
            amount={totalDeductions}
            icon={
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-900" />
              </div>
            }
          />
        </div>

        {/* Analyze Button */}
        <div className="mb-8">
          <AnalyzeButton />
        </div>

        {/* Category Groups */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Deductions by Category
          </h2>
          <div className="space-y-4">
            {categoryGroups.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                <p className="text-slate-600">No deductions found for {year}</p>
              </div>
            ) : (
              categoryGroups.map((group) => (
                <CategoryGroupCard key={group.category} group={group} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

