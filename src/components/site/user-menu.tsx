// import { LayoutDashboardIcon, LogOutIcon, UserIcon } from "lucide-react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// export function UserMenu({
//   name,
//   dashboardHref,
// }: {
//   name?: string | null;
//   dashboardHref: string;
// }) {
//   return (
//     <Popover>
//       <PopoverTrigger
//         render={
//           <Button
//             variant="ghost"
//             size="sm"
//             className="hidden sm:inline-flex"
//             aria-label="Open user menu"
//           >
//             {name ?? "Account"}
//           </Button>
//         }
//       />
//       <PopoverContent className="w-56 p-1.5" align="end" sideOffset={6}>
//         <div className="flex flex-col">
//           <div className="flex items-center justify-between rounded-md px-2 py-1.5">
//             <span
//               className="text-sm font-medium truncate"
//               title={name ?? undefined}
//             >
//               {name ?? "Account"}
//             </span>
//           </div>
//           <div className="h-px bg-border my-1" />
//           <Button
//             nativeButton={false}
//             render={<Link href={dashboardHref} />}
//             variant="ghost"
//             size="sm"
//             className="justify-start gap-2"
//           >
//             <LayoutDashboardIcon className="size-3.5" />
//             Dashboard
//           </Button>
//           <Button
//             nativeButton={false}
//             render={<Link href="/profile" />}
//             variant="ghost"
//             size="sm"
//             className="justify-start gap-2"
//           >
//             <UserIcon className="size-3.5" />
//             Profile
//           </Button>
//           <div className="h-px bg-border my-1" />
//           <form action="/logout" method="post">
//             <Button
//               type="submit"
//               variant="ghost"
//               size="sm"
//               className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10"
//             >
//               <LogOutIcon className="size-3.5" />
//               Logout
//             </Button>
//           </form>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }

import {
    ChevronDownIcon,
    LayoutDashboardIcon,
    LogOutIcon,
    UserIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function UserMenu({
    name,
    dashboardHref,
}: {
    name?: string | null;
    dashboardHref: string;
}) {
    const displayName = name?.trim() || "Account";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden h-9 items-center gap-2 rounded-full px-2 sm:inline-flex"
                        aria-label="Open user menu"
                    >
                        {/* Avatar */}
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {initial}
                        </span>

                        {/* Name */}
                        <span
                            className="max-w-28 truncate text-sm font-medium"
                            title={displayName}
                        >
                            {displayName}
                        </span>

                        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                    </Button>
                }
            />

            <PopoverContent className="w-60 p-1.5" align="end" sideOffset={8}>
                <div className="flex flex-col">
                    {/* User information */}
                    <div className="flex items-center gap-3 rounded-lg px-2.5 py-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {initial}
                        </div>

                        <div className="min-w-0">
                            <p
                                className="truncate text-sm font-semibold"
                                title={displayName}
                            >
                                {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                My account
                            </p>
                        </div>
                    </div>

                    <div className="my-1 h-px bg-border" />

                    {/* Dashboard */}
                    <Button
                        nativeButton={false}
                        render={<Link href={dashboardHref} />}
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2.5 rounded-md"
                    >
                        <LayoutDashboardIcon className="size-4 text-muted-foreground" />
                        Dashboard
                    </Button>

                    {/* Profile */}
                    <Button
                        nativeButton={false}
                        render={<Link href="/profile" />}
                        variant="ghost"
                        size="sm"
                        className="justify-start gap-2.5 rounded-md"
                    >
                        <UserIcon className="size-4 text-muted-foreground" />
                        Profile
                    </Button>

                    <div className="my-1 h-px bg-border" />

                    {/* Logout */}
                    <form action="/logout" method="post">
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2.5 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOutIcon className="size-4" />
                            Logout
                        </Button>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
    );
}
