import { z } from "zod";

/**
 * `POST /auth/login` only checks the pair, so the form stays light: a real
 * email shape and a non-empty password.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "That password is too long"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(72, "That password is too long"),
  role: z.enum(["OWNER", "MANAGER", "TENANT"], {
    message: "Role is required",
  }),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .min(10, "Phone number must be at least 10 digits"),
});

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  otp: z
    .string()
    .trim()
    .min(1, "OTP is required")
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

export type LoginValues = z.input<typeof loginSchema>;
export type LoginInput = z.output<typeof loginSchema>;
export type RegisterValues = z.input<typeof registerSchema>;
export type RegisterInput = z.output<typeof registerSchema>;
export type VerifyEmailValues = z.input<typeof verifyEmailSchema>;
export type VerifyEmailInput = z.output<typeof verifyEmailSchema>;
