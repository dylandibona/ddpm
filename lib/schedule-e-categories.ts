// IRS Schedule E categories for rental property deductions
export const SCHEDULE_E_CATEGORIES: Record<string, string> = {
  Advertising: "Advertising",
  Auto: "Auto and Travel",
  Cleaning: "Cleaning and Maintenance",
  Commissions: "Commissions",
  Insurance: "Insurance",
  Legal: "Legal and Professional Fees",
  Management: "Management Fees",
  Mortgage: "Mortgage Interest",
  Other: "Other Expenses",
  Repairs: "Repairs",
  Supplies: "Supplies",
  Taxes: "Taxes",
  Travel: "Travel",
  Utilities: "Utilities",
};

// Map transaction categories to Schedule E categories
export function mapToScheduleECategory(category: string | null): string {
  if (!category) return SCHEDULE_E_CATEGORIES.Other;

  const categoryLower = category.toLowerCase();

  // Cleaning and Maintenance
  if (
    categoryLower.includes("cleaning") ||
    categoryLower.includes("maintenance") ||
    categoryLower.includes("landscaping") ||
    categoryLower.includes("lawn")
  ) {
    return SCHEDULE_E_CATEGORIES.Cleaning;
  }

  // Repairs
  if (
    categoryLower.includes("repair") ||
    categoryLower.includes("fix") ||
    categoryLower.includes("replacement")
  ) {
    return SCHEDULE_E_CATEGORIES.Repairs;
  }

  // Insurance
  if (categoryLower.includes("insurance")) {
    return SCHEDULE_E_CATEGORIES.Insurance;
  }

  // Management Fees
  if (
    categoryLower.includes("management") ||
    categoryLower.includes("property management")
  ) {
    return SCHEDULE_E_CATEGORIES.Management;
  }

  // Travel
  if (
    categoryLower.includes("travel") ||
    categoryLower.includes("mileage") ||
    categoryLower.includes("gas")
  ) {
    return SCHEDULE_E_CATEGORIES.Travel;
  }

  // Auto
  if (
    categoryLower.includes("auto") ||
    categoryLower.includes("vehicle") ||
    categoryLower.includes("car")
  ) {
    return SCHEDULE_E_CATEGORIES.Auto;
  }

  // Utilities
  if (
    categoryLower.includes("utility") ||
    categoryLower.includes("electric") ||
    categoryLower.includes("water") ||
    categoryLower.includes("gas") ||
    categoryLower.includes("internet") ||
    categoryLower.includes("phone")
  ) {
    return SCHEDULE_E_CATEGORIES.Utilities;
  }

  // Taxes
  if (categoryLower.includes("tax")) {
    return SCHEDULE_E_CATEGORIES.Taxes;
  }

  // Legal
  if (
    categoryLower.includes("legal") ||
    categoryLower.includes("attorney") ||
    categoryLower.includes("lawyer")
  ) {
    return SCHEDULE_E_CATEGORIES.Legal;
  }

  // Advertising
  if (
    categoryLower.includes("advertising") ||
    categoryLower.includes("marketing") ||
    categoryLower.includes("ad")
  ) {
    return SCHEDULE_E_CATEGORIES.Advertising;
  }

  // Commissions
  if (categoryLower.includes("commission")) {
    return SCHEDULE_E_CATEGORIES.Commissions;
  }

  // Supplies
  if (categoryLower.includes("supply") || categoryLower.includes("material")) {
    return SCHEDULE_E_CATEGORIES.Supplies;
  }

  // Mortgage Interest
  if (
    categoryLower.includes("mortgage") ||
    categoryLower.includes("interest") ||
    categoryLower.includes("loan")
  ) {
    return SCHEDULE_E_CATEGORIES.Mortgage;
  }

  // Default to Other
  return SCHEDULE_E_CATEGORIES.Other;
}

