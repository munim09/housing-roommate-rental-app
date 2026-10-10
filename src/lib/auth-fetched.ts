"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = (process.env.NEXT_PUBLIC_BACKEND_API_URL || "") + "/api/v1";

async function getToken(): Promise<string | undefined> {
    try {
        if (typeof window === "undefined") {
            const { cookies } = await import("next/headers");
            return (await cookies()).get("accessToken")?.value;
        }
        return undefined;
    } catch {
        return undefined;
    }
}

async function handleError(res: Response, data: unknown): Promise<never> {
    let message = `Request failed: ${res.status}`;
    if (data && typeof data === "object") {
        const anyData = data as any;
        const e = anyData.error || anyData.errorBody;
        if (e?.message) message = e.message;
        else if (anyData.message) message = anyData.message;
    }
    if (res.status === 401) {
        if (typeof window === "undefined") {
            const { redirect } = await import("next/navigation");
            redirect("/login");
        } else {
            window.location.href = "/login";
        }
    }
    throw new Error(message);
}

export async function authedFetch(
    input: string,
    init?: RequestInit,
): Promise<Response> {
    //   console.log("authedFetch....");
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
        redirect("/auth/login");
    }
    // const token = await getToken();

    //   console.log("token", token);
    const res = await fetch(API + input, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers || {}),
        },
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
    });
    //   console.log("authedFetch res", res);
    if (!res.ok) {
        let data: any;
        try {
            data = await res.json();
        } catch {
            data = {};
        }
        await handleError(res, data);
    }
    return res;
}

export async function authedFetchJson<T = any>(
    input: string,
    init?: RequestInit,
): Promise<T> {
    const res = await authedFetch(input, init);
    let data: any;
    try {
        data = await res.json();
    } catch {
        data = {};
    }
    return data as T;
}
