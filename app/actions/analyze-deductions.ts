"use server";

import { getOpenAIClient } from "@/lib/openai";
import { getTaxPrepData } from "./get-tax-prep-data";

export interface DeductionSuggestion {
  type: "low_category" | "capitalization";
  category?: string;
  title: string;
  description: string;
  amount?: number;
}

export async function analyzeDeductions() {
  try {
    // Get tax prep data
    const taxDataResult = await getTaxPrepData();

    if (!taxDataResult.success || !taxDataResult.data) {
      return {
        success: false,
        error: "Failed to fetch tax prep data",
      };
    }

    const { categoryGroups, totalDeductions, year } = taxDataResult.data;

    // Prepare data for AI analysis
    const categorySummary = categoryGroups.map((group) => ({
      category: group.category,
      total: group.total,
      transactionCount: group.transactionCount,
    }));

    // Get repairs over $2,500
    const repairsGroup = categoryGroups.find(
      (g) => g.category === "Repairs"
    );
    const highValueRepairs =
      repairsGroup?.transactions.filter((tx) => Math.abs(tx.amount) >= 2500) ||
      [];

    const openai = getOpenAIClient();

    const prompt = `You are a tax advisor reviewing rental property deductions for Schedule E (Form 1040).

The property owner has the following deduction categories for ${year}:

${categorySummary
  .map(
    (cat) =>
      `- ${cat.category}: $${cat.total.toFixed(2)} (${cat.transactionCount} transactions)`
  )
  .join("\n")}

Total Deductions: $${totalDeductions.toFixed(2)}

High-value repairs (over $2,500):
${highValueRepairs.length > 0
  ? highValueRepairs
      .map(
        (tx) =>
          `- $${Math.abs(tx.amount).toFixed(2)} on ${new Date(tx.date).toLocaleDateString()} from ${tx.vendor || "Unknown vendor"}`
      )
      .join("\n")
  : "None"}

Analyze this data and provide suggestions in the following areas:

1. LOW CATEGORIES: Identify categories that seem unusually low or missing. For example:
   - If Travel is $0, suggest: "You have $0 in Travel expenses. Did you visit the property this year? Travel expenses (mileage, meals, lodging) are deductible."
   - If Auto is $0, suggest: "You have $0 in Auto expenses. Consider tracking mileage for property visits."
   - Similar for other categories that might be missing

2. CAPITALIZATION: For repairs over $2,500, determine if they should be capitalized (depreciated) instead of deducted. Generally:
   - Repairs that improve the property or extend its life should be capitalized
   - Routine maintenance and small repairs can be deducted
   - Suggest capitalization for major improvements, new installations, or significant upgrades

Return your response as a JSON object with this exact structure:
{
  "suggestions": [
    {
      "type": "low_category",
      "category": "Travel",
      "title": "Missing Travel Expenses",
      "description": "You have $0 in Travel expenses. Did you visit the property this year? Travel expenses (mileage, meals, lodging) are deductible."
    },
    {
      "type": "capitalization",
      "category": "Repairs",
      "title": "Consider Capitalizing Large Repair",
      "description": "Repair of $3,500 on [date] from [vendor] appears to be a significant improvement. Consider capitalizing this expense and depreciating it over time instead of taking a full deduction this year.",
      "amount": 3500
    }
  ]
}

Be specific and actionable. Only include suggestions that are relevant and helpful.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a tax advisor specializing in rental property deductions. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);

    if (!Array.isArray(result.suggestions)) {
      throw new Error("Invalid response format: suggestions must be an array");
    }

    return {
      success: true,
      suggestions: result.suggestions as DeductionSuggestion[],
    };
  } catch (error) {
    console.error("Error analyzing deductions:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

