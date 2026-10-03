"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { clearSession } from "@/lib/session";

/**
 * Sign-out has to be a real document navigation, not a client-side one.
 *
 * `/logout` finishes with a redirect back to `/`, which is very often the page
 * the click happened on. A `router.replace` there is a no-op segment change:
 * nothing commits, the client router cache keeps replaying the RSC payload that
 * was rendered while `authUser` still existed, and this component stays mounted
 * with `isPending` stuck on — a spinner that never stops and a header that never
 * re-renders. A native form POST avoids all of that: the browser leaves the page,
 * the handler clears the httpOnly cookies, and `/` is re-requested from scratch.
 *
 * Both wipes below are synchronous, so they finish before the browser navigates.
 * `localStorage` still mirrors the token, and `readAccessToken()` falls back to
 * it, so without these a signed-out tab would keep sending a stale
 * `Authorization` header.
 */
export function LogoutButton() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  function handleSubmit() {
    clearSession();
    // `useSession` reads straight from storage, so its cached copy has to go too.
    queryClient.clear();
    setIsPending(true);
    // No `preventDefault()` on purpose — the browser performs the POST itself.
    // That also keeps sign-out working when this script never loads.
  }

  return (
    <form action="/logout" method="post" onSubmit={handleSubmit}>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? <Spinner /> : <LogOutIcon aria-hidden="true" />}
        Logout
      </Button>
    </form>
  );
}
