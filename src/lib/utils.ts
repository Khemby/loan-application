import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency with no decimal places.
 * Example: 425000 → "$425,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate the number of whole days between a given date and now.
 */
export function getDaysInStage(stageEnteredAt: Date): number {
  return Math.floor(
    (Date.now() - stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Determine urgency level based on the loan stage and how long it has been
 * in that stage.
 *
 * - Approved / Closed → always green
 * - Lead / Application → ≤3 days green, 4-6 yellow, 7+ red
 * - Processing / Underwriting → ≤7 days green, 8-13 yellow, 14+ red
 */
export function getUrgencyLevel(
  stage: string,
  stageEnteredAt: Date
): "green" | "yellow" | "red" {
  const upperStage = stage.toUpperCase();

  if (upperStage === "APPROVED" || upperStage === "CLOSED") {
    return "green";
  }

  const days = getDaysInStage(stageEnteredAt);

  if (upperStage === "LEAD" || upperStage === "APPLICATION") {
    if (days <= 3) return "green";
    if (days <= 6) return "yellow";
    return "red";
  }

  // Processing / Underwriting (and any future stages default to this bucket)
  if (days <= 7) return "green";
  if (days <= 13) return "yellow";
  return "red";
}
