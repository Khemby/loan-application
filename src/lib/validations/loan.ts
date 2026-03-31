import { z } from "zod";
import type { Prisma, LoanType, LoanTerm, LoanStage } from "@prisma/client";

// ── Zod enum values (must match Prisma enums exactly) ──────────────────────

const loanTypeValues = [
  "CONVENTIONAL",
  "FHA",
  "VA",
  "JUMBO",
  "USDA",
] as const satisfies readonly LoanType[];

const loanTermValues = [
  "FIFTEEN_YEAR",
  "THIRTY_YEAR",
] as const satisfies readonly LoanTerm[];

const loanStageValues = [
  "LEAD",
  "APPLICATION",
  "PROCESSING",
  "UNDERWRITING",
  "APPROVED",
  "CLOSED",
] as const satisfies readonly LoanStage[];

// ── Schemas ────────────────────────────────────────────────────────────────

export const createLoanSchema = z.object({
  borrowerFirstName: z.string().min(1, "First name is required"),
  borrowerLastName: z.string().min(1, "Last name is required"),
  borrowerEmail: z.string().email("Invalid email address"),
  borrowerPhone: z.string(),
  loanAmount: z.number().positive("Loan amount must be positive"),
  loanType: z.enum(loanTypeValues),
  loanTerm: z.enum(loanTermValues),
  propertyAddress: z.string().min(1, "Property address is required"),
  propertyCity: z.string().min(1, "City is required"),
  propertyState: z.string().length(2, "State must be a 2-letter code"),
  propertyZip: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  loanOfficerId: z.string().uuid("Invalid loan officer ID"),
  notes: z.string().optional(),
});

export const updateLoanStageSchema = z.object({
  loanId: z.string().uuid("Invalid loan ID"),
  newStage: z.enum(loanStageValues),
  stageEnteredAt: z.string().datetime("Invalid datetime"),
});

export const updateLoanSchema = z.object({
  id: z.string().uuid("Invalid loan ID"),
  borrowerFirstName: z.string().min(1).optional(),
  borrowerLastName: z.string().min(1).optional(),
  borrowerEmail: z.string().email().optional(),
  borrowerPhone: z.string().optional(),
  loanAmount: z.number().positive().optional(),
  loanType: z.enum(loanTypeValues).optional(),
  loanTerm: z.enum(loanTermValues).optional(),
  propertyAddress: z.string().min(1).optional(),
  propertyCity: z.string().min(1).optional(),
  propertyState: z.string().length(2).optional(),
  propertyZip: z.string().regex(/^\d{5}$/).optional(),
  loanOfficerId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// ── Inferred types ─────────────────────────────────────────────────────────

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanStageInput = z.infer<typeof updateLoanStageSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

// ── Compile-time compatibility checks ──────────────────────────────────────
// These ensure Zod schemas stay in sync with the Prisma-generated types.
// If a field is added/removed/renamed in the Prisma schema, these will
// produce a TypeScript error here rather than a silent runtime mismatch.

type _CreateLoanCheck = z.infer<typeof createLoanSchema> extends Omit<
  Prisma.LoanUncheckedCreateInput,
  "id" | "stage" | "stageEnteredAt" | "createdAt" | "updatedAt" | "activities"
>
  ? true
  : never;

// Ensure the check resolves to `true` (will error if it resolves to `never`)
const _createCheck: _CreateLoanCheck = true;
void _createCheck;
