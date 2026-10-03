"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { clearSession } from "@/lib/session";

/**
 * The `/logout` route can only clear the httpOnly cookies, but `saveSession`
 * also mirrors the token and the user into `localStorage`. Wiping that half
 * first is what stops a signed-out browser from still sending a stale
 * `Authorization` header through `readAccessToken`.
 */
export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  function handleLogout() {
    setIsPending(true);
    clearSession();
    // `useSession` reads straight from storage, so its cached copy has to go
    // too or the header would still render a signed-in user.
    queryClient.clear();
    router.replace("/logout");
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleLogout}
    >
      {isPending ? <Spinner /> : <LogOutIcon aria-hidden="true" />}
      Logout
    </Button>
  );
}
