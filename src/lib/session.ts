import type { AuthUser, UserRole } from "@/types";

const TOKEN_KEY = "dwellio.accessToken";
const USER_KEY = "dwellio.user";

/**
 * The cookies `/login` sets. They are httpOnly, so only a server handler
 * can delete them — that is what the `/logout` route is for.
 */
export const SESSION_COOKIES = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "authUser",
} as const;

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin",
  OWNER: "/owner/dashboard",
  MANAGER: "/manager/dashboard",
  TENANT: "/tenant/dashboard",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part === undefined) return null;
    return part.split(";").shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds = 86400) {
  if (!isBrowser()) return;
  document.cookie =
    name +
    "=" +
    value +
    "; path=/; max-age=" +
    maxAgeSeconds +
    "; SameSite=Lax";
}

function deleteCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function readAccessToken() {
  if (!isBrowser()) return null;
  return (
    getCookie(SESSION_COOKIES.accessToken) ??
    window.localStorage.getItem(TOKEN_KEY)
  );
}

export function readRefreshToken() {
  if (!isBrowser()) return null;
  return getCookie(SESSION_COOKIES.refreshToken);
}

export function readStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw =
    getCookie(SESSION_COOKIES.user) ?? window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    deleteCookie("authUser");
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function saveSession(
  user: AuthUser,
  accessToken: string,
  refreshToken?: string,
) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie(SESSION_COOKIES.accessToken, accessToken, 60 * 60 * 24);
  setCookie(SESSION_COOKIES.user, JSON.stringify(user), 60 * 60 * 24);
  if (refreshToken) {
    setCookie(SESSION_COOKIES.refreshToken, refreshToken, 60 * 60 * 24 * 7);
  }
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  deleteCookie(SESSION_COOKIES.accessToken);
  deleteCookie(SESSION_COOKIES.refreshToken);
  deleteCookie(SESSION_COOKIES.user);
}
