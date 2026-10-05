import apiClient from "@/lib/api-client";
import type {
    ApiResponse,
    LoginPayload,
    LoginResult,
    RegisterPayload,
    RegisterResult,
    VerifyEmailPayload,
} from "@/types";

/** `POST /login` — public. Sets httpOnly cookies and returns the tokens. */
export function login(payload: LoginPayload) {
    return apiClient<ApiResponse<LoginResult>>("/auth/login", {
        method: "POST",
        body: payload,
    });
}

/** `POST /auth/refresh-token` — cookie transport, rotates both tokens. */
export function refreshToken() {
    return apiClient<ApiResponse<Omit<LoginResult, "user">>>(
        "/auth/refresh-token",
        { method: "POST" },
    );
}

/** `POST /auth/register` — public. Sends OTP to email. */
export function register(payload: RegisterPayload) {
    return apiClient<ApiResponse<RegisterResult>>("/auth/register", {
        method: "POST",
        body: payload,
    });
}

/** `POST /auth/verify` — public. Verifies email with OTP. */
export function verifyEmail(payload: VerifyEmailPayload) {
    return apiClient<ApiResponse<Record<string, never>>>("/auth/verify", {
        method: "POST",
        body: payload,
    });
}
