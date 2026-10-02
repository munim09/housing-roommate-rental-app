import type { UserRole } from "@/types";

export interface DemoAccount {
  role: UserRole;
  name: string;
  email: string;
  password: string;
}

/**
 * Seeded accounts from the backend's `prisma/seed.ts`. Every seeded user shares
 * one password, which is what makes the one-click demo login work.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    name: "Admin",
    email: "admin@housing.com",
    password: "password123",
  },
  {
    role: "OWNER",
    name: "Owner",
    email: "szdesco@gmail.com",
    password: "password123",
  },
  {
    role: "MANAGER",
    name: "Manager",
    email: "sz.munim@gmail.com",
    password: "password123",
  },
  {
    role: "TENANT",
    name: "Tenantr",
    email: "szmunim9@gmail.com",
    password: "password123",
  },
];
