"use server";

import { cookies } from "next/headers";
import { jwtUtils } from "@/app/utils/jwt";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";

export const getNewAccessToken = async () => {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refreshToken")?.value || null;

  if (!refreshToken) {
    // throw new Error("User Not Logged In!");

    return {
      success: false,
      message: "Refresh token not found!",
    };
  }

  const res = await fetch(`${API}/api/auth/refresh-token`, {
    method: "POST",
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
    cache: "no-cache",
  });

  const result = await res.json();

  return result;
};

export const isAccessTokenExist = async () => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value || null;
  const refreshToken = cookieStore.get("refreshToken")?.value || null;

  if (!accessToken && !refreshToken) {
    throw new Error("User Not Logged In!");

    // return {
    //     success: false,
    //     message: "User not logged in!"
    // }
  }

  const decodedAccessToken = accessToken
    ? jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
    : null;

  const decodedRefreshToken = refreshToken
    ? jwtUtils.verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      )
    : null;

  if (!decodedAccessToken?.success && decodedRefreshToken?.success) {
    //access token has expired but refresh token is valid, get new access token from backend
    const result = await getNewAccessToken();

    if (result.success) {
      const newAccessToken = result.data.accessToken;

      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      });

      accessToken = newAccessToken;
    }
  }

  return accessToken;
};
