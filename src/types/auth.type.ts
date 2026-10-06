export const USER_ROLES = ["ADMIN", "OWNER", "MANAGER", "TENANT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  OWNER: "Owner",
  MANAGER: "Manager",
  TENANT: "Tenant",
};

export type UserStatus =
  | "ACTIVE"
  | "PENDING_APPROVAL"
  | "SUSPENDED"
  | "REJECTED";

/** The `user` object `POST /login` resolves with. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * The backend has no `/auth/me` route, so the signed-in user is whatever
 * `/login` returned, cached client side by the session layer.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
}

export interface RegisterResult {
  email: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}
