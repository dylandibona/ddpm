"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getDashboardData() {
  try {
    // Get the start of the current year
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Calculate YTD Income (positive amounts)
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        date: {
          gte: yearStart,
        },
        amount: {
          gt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate YTD Expenses (negative amounts, but we'll sum the absolute values)
    const expensesResult = await prisma.transaction.aggregate({
      where: {
        date: {
          gte: yearStart,
        },
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get recent transactions (last 20, ordered by date desc)
    const recentTransactions = await prisma.transaction.findMany({
      take: 20,
      orderBy: {
        date: "desc",
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
    });

    // Convert Decimal to number for calculations
    const totalIncome = incomeResult._sum.amount
      ? Number(incomeResult._sum.amount)
      : 0;
    const totalExpenses = expensesResult._sum.amount
      ? Math.abs(Number(expensesResult._sum.amount))
      : 0;

    return {
      success: true,
      data: {
        totalIncomeYTD: totalIncome,
        totalExpensesYTD: totalExpenses,
        netYTD: totalIncome - totalExpenses,
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          date: tx.date,
          amount: Number(tx.amount),
          category: tx.category,
          vendor: tx.vendor,
          isFlagged: tx.isFlagged,
          flagReason: tx.flagReason,
          propertyName: tx.statement.property.name,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

