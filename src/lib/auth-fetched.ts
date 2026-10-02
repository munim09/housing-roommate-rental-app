import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL + "/api/v1";

export async function authedFetch(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  console.log("accessToken", accessToken);

  const base = API.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${base}${cleanPath}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    credentials: "include",
  });

  console.log(res);

  return res;
}
