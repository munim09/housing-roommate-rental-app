import type { MeResponse } from "@/api/profile.api";
import { ProfileForm } from "@/components/modules/profile/profile-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { authedFetchJson } from "@/lib/auth-fetched";
import { SESSION_COOKIES } from "@/lib/session";
import type { ApiResponse, AuthUser } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Profile",
};

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get(SESSION_COOKIES.user)?.value;
    let user: AuthUser | null = null;
    try {
        user = userCookie ? (JSON.parse(userCookie) as AuthUser) : null;
    } catch {
        user = null;
    }
    if (!user) redirect("/login");

    let me: MeResponse | null = null;
    try {
        // const res = await getMe();
        const res = await authedFetchJson<ApiResponse<MeResponse>>("/auth/me");
        console.log("res", res);
        if (res.success) me = res.data;
    } catch (error) {
        me = null;
        console.log("error", error);
    }

    return (
        <>
            <SiteHeader />
            <main className="flex-1">
                <section className="border-b">
                    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 space-y-8">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Profile
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                View and manage your account information.
                            </p>
                        </div>

                        {me ? (
                            <div className="space-y-8">
                                <div className="grid gap-4 max-w-2xl rounded-xl border bg-muted/40 p-4 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-muted-foreground">
                                            Name
                                        </dt>
                                        <dd className="font-medium">
                                            {me.name}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-muted-foreground">
                                            Email
                                        </dt>
                                        <dd>{me.email}</dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-muted-foreground">
                                            Phone
                                        </dt>
                                        <dd>{me.phone}</dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-muted-foreground">
                                            Role
                                        </dt>
                                        <dd>{me.role}</dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <dt className="text-muted-foreground">
                                            Status
                                        </dt>
                                        <dd>{me.status}</dd>
                                    </div>
                                    {me.tenantProfile?.nid ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-muted-foreground">
                                                NID
                                            </dt>
                                            <dd>{me.tenantProfile.nid}</dd>
                                        </div>
                                    ) : null}
                                    {me.tenantProfile?.address ? (
                                        <div className="flex items-start justify-between gap-3">
                                            <dt className="text-muted-foreground shrink-0">
                                                Address
                                            </dt>
                                            <dd className="text-right break-words">
                                                {me.tenantProfile.address}
                                            </dd>
                                        </div>
                                    ) : null}
                                    {me.tenantProfile?.occupation ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <dt className="text-muted-foreground">
                                                Occupation
                                            </dt>
                                            <dd>
                                                {me.tenantProfile.occupation}
                                            </dd>
                                        </div>
                                    ) : null}
                                </div>

                                {me.role !== "ADMIN" ? (
                                    <div className="mx-auto w-full max-w-2xl space-y-4">
                                        <h2 className="text-lg font-medium">
                                            Update profile
                                        </h2>
                                        <ProfileForm me={me} />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Admin users cannot update their profile
                                        through this form.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Could not load profile information.
                            </p>
                        )}
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
