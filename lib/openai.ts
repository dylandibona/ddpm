import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  return new OpenAI({
    apiKey,
  });
}

export interface ExtractedTransaction {
  date: string; // ISO date string
  amount: number;
  vendor: string | null;
  category: string | null;
  isFlagged: boolean;
  flagReason: string | null;
}

export interface TransactionExtractionResult {
  transactions: ExtractedTransaction[];
}

export async function extractTransactionsFromText(
  statementText: string
): Promise<ExtractedTransaction[]> {
  const openai = getOpenAIClient();

  const prompt = `You are analyzing a financial statement (bank statement, credit card statement, or similar document) for a rental property management system.

Your task is to extract all transactions from the provided text and identify any issues.

For each transaction, extract:
- date: The transaction date (use ISO format YYYY-MM-DD)
- amount: The transaction amount as a number (negative for expenses, positive for income)
- vendor: The vendor/merchant name (e.g., "Home Depot", "Electric Company", "Tenant Payment")
- category: The transaction category (e.g., "Maintenance", "Utilities", "Rent Income", "Insurance", "Property Management", "Repairs", "Supplies")

Flag a transaction (set isFlagged: true) if ANY of the following apply:
1. DUPLICATE: The transaction appears to be a duplicate of another transaction in the same statement (same vendor, same amount, same or very close date)
2. HIGH_MAINTENANCE: The transaction is categorized as maintenance/repairs and the amount is unusually high (e.g., over $1000 for a single maintenance item, or multiple high-cost maintenance items that seem excessive)
3. MISSING_DETAILS: Critical information is missing (no vendor name, no date, or amount is unclear)

For flagged transactions, provide a clear flagReason explaining why it was flagged (e.g., "Duplicate transaction", "Unusually high maintenance cost: $2,500", "Missing vendor name").

Return your response as a JSON object with this exact structure:
{
  "transactions": [
    {
      "date": "2024-01-15",
      "amount": -125.50,
      "vendor": "Home Depot",
      "category": "Maintenance",
      "isFlagged": false,
      "flagReason": null
    },
    {
      "date": "2024-01-20",
      "amount": -2500.00,
      "vendor": "ABC Plumbing",
      "category": "Maintenance",
      "isFlagged": true,
      "flagReason": "Unusually high maintenance cost: $2,500"
    }
  ]
}

Statement text to analyze:
${statementText}

Return ONLY valid JSON, no additional text or explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a financial data extraction assistant. Always return valid JSON only, no markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const result: TransactionExtractionResult = JSON.parse(content);

    // Validate and return transactions
    if (!Array.isArray(result.transactions)) {
      throw new Error("Invalid response format: transactions must be an array");
    }

    return result.transactions;
  } catch (error) {
    console.error("Error extracting transactions:", error);
    throw error;
  }
}

