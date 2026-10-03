import { z } from "zod";

/** Trimmed length matches the Prisma `name` column on City and Area. */
const locationName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const citySchema = z.object({
  name: locationName,
});

export const areaSchema = z.object({
  cityId: z.string().trim().min(1, "Select a city"),
  name: locationName,
});

export type CityValues = z.input<typeof citySchema>;
export type AreaValues = z.input<typeof areaSchema>;
