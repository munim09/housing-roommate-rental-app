import type { Metadata } from "next";
import { LoginForm } from "@/components/form/login-form";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Dwellio to follow your applications, manage your listings and pay rent.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start lg:py-16">
            <div className="grid gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Welcome back
              </h1>
              <p className="max-w-xl text-muted-foreground text-pretty">
                Tenants track viewings, applications and rent in one place.
                Owners and managers publish flats, review applications and chase
                invoices from the same account system.
              </p>

              <ul className="mt-2 grid gap-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  Access tokens are issued as httpOnly cookies with a Bearer
                  fallback for every protected route.
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  Each role gets its own dashboard, navigation and permissions.
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  Need an account first? Register as a tenant, owner or manager
                  and verify your email to continue.
                </li>
              </ul>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Use your email and password, or pick a demo role below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
