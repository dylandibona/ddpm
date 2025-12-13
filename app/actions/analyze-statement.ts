"use server";

import { extractTransactionsFromText } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function analyzeStatement(statementId: string) {
  try {
    // Get the statement from database
    const statement = await prisma.statement.findUnique({
      where: { id: statementId },
      include: {
        transactions: true, // Check for existing transactions
      },
    });

    if (!statement) {
      return {
        success: false,
        error: "Statement not found",
      };
    }

    if (!statement.rawText) {
      return {
        success: false,
        error: "Statement has no raw text to analyze. Please extract text from PDF first.",
      };
    }

    // Check if transactions already exist
    if (statement.transactions.length > 0) {
      return {
        success: false,
        error: "Statement already has transactions. Delete existing transactions first to re-analyze.",
      };
    }

    // Extract transactions using OpenAI
    const extractedTransactions = await extractTransactionsFromText(
      statement.rawText
    );

    if (extractedTransactions.length === 0) {
      return {
        success: true,
        message: "No transactions found in statement",
        transactionsCreated: 0,
      };
    }

    // Create transactions in database
    const transactions = await Promise.all(
      extractedTransactions.map((tx) => {
        // Parse the date
        const transactionDate = new Date(tx.date);
        
        // Validate date
        if (isNaN(transactionDate.getTime())) {
          throw new Error(`Invalid date format: ${tx.date}`);
        }

        return prisma.transaction.create({
          data: {
            date: transactionDate,
            amount: new Prisma.Decimal(tx.amount),
            category: tx.category,
            vendor: tx.vendor,
            isFlagged: tx.isFlagged,
            flagReason: tx.flagReason,
            statementId: statement.id,
          },
        });
      })
    );

    const flaggedCount = transactions.filter((t) => t.isFlagged).length;

    return {
      success: true,
      message: `Successfully extracted ${transactions.length} transaction(s)${flaggedCount > 0 ? ` (${flaggedCount} flagged)` : ""}`,
      transactionsCreated: transactions.length,
      flaggedCount,
    };
  } catch (error) {
    console.error("Error analyzing statement:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

