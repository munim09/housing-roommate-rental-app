import { z } from "zod";

/**
 * `POST /tenant/maintenance-requests` — the backend model allows skipping the
 * description, but a request nobody can act on is useless, so the form
 * requires one. Priority defaults to `MEDIUM`, matching the Prisma default.
 */
export const maintenanceRequestSchema = z.object({
  issue: z
    .string()
    .trim()
    .min(5, "Summarise the issue in at least 5 characters")
    .max(200, "Keep the summary under 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least 10 characters")
    .max(2000, "Keep it under 2000 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type MaintenanceRequestValues = z.input<typeof maintenanceRequestSchema>;

export const EMPTY_MAINTENANCE_REQUEST_VALUES: MaintenanceRequestValues = {
  issue: "",
  description: "",
  priority: "MEDIUM",
};

/**
 * `PATCH /manager/maintenance-requests/:requestId` — the status is always
 * sent, the two timestamps only when filled in. A resolution that predates the
 * scheduled visit is rejected so the drawer never shows an impossible pair.
 */
export const maintenanceUpdateSchema = z
  .object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"]),
    scheduledFor: z.string(),
    resolvedAt: z.string(),
  })
  .refine(
    (value) =>
      !value.scheduledFor ||
      !value.resolvedAt ||
      value.resolvedAt >= value.scheduledFor,
    {
      message: "Resolution must be on or after the scheduled visit",
      path: ["resolvedAt"],
    },
  );

export type MaintenanceUpdateValues = z.input<typeof maintenanceUpdateSchema>;

/**
 * `<input type="datetime-local">` reads and writes local wall time, while the
 * API stores ISO timestamps — these two helpers translate between them, and an
 * empty or unparsable value maps to `""` / `undefined` instead of NaN.
 */
export function toDateTimeLocal(value?: string | null): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function localDateTimeToIso(value: string): string | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed.toISOString();
}
