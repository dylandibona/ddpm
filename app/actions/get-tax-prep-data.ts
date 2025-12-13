"use server";

import { prisma } from "@/lib/prisma";
import { mapToScheduleECategory, SCHEDULE_E_CATEGORIES } from "@/lib/schedule-e-categories";

export interface CategoryGroup {
  category: string;
  total: number;
  transactionCount: number;
  transactions: Array<{
    id: string;
    date: Date;
    amount: number;
    vendor: string | null;
    category: string | null;
    propertyName: string;
  }>;
}

export async function getTaxPrepData() {
  try {
    // Get all transactions for the current year
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: yearStart,
        },
      },
      include: {
        statement: {
          include: {
            property: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Group transactions by Schedule E category
    const categoryMap = new Map<string, CategoryGroup>();

    // Initialize all categories with zero totals
    Object.values(SCHEDULE_E_CATEGORIES).forEach((category) => {
      categoryMap.set(category, {
        category,
        total: 0,
        transactionCount: 0,
        transactions: [],
      });
    });

    // Group transactions
    transactions.forEach((tx) => {
      const scheduleECategory = mapToScheduleECategory(tx.category);
      const amount = Number(tx.amount);

      // Only include expenses (negative amounts) for deductions
      if (amount < 0) {
        const group = categoryMap.get(scheduleECategory);
        if (group) {
          group.total += Math.abs(amount);
          group.transactionCount += 1;
          group.transactions.push({
            id: tx.id,
            date: tx.date,
            amount: amount,
            vendor: tx.vendor,
            category: tx.category,
            propertyName: tx.statement.property.name,
          });
        }
      }
    });

    // Convert to array and sort by total (descending), filter out zero totals
    const categoryGroups = Array.from(categoryMap.values())
      .filter((group) => group.total > 0)
      .sort((a, b) => b.total - a.total);

    // Calculate total deductions
    const totalDeductions = categoryGroups.reduce(
      (sum, group) => sum + group.total,
      0
    );

    return {
      success: true,
      data: {
        categoryGroups,
        totalDeductions,
        year: now.getFullYear(),
      },
    };
  } catch (error) {
    console.error("Error fetching tax prep data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

