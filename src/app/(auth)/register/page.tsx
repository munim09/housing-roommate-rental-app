import type { Metadata } from "next";
import { RegisterForm } from "@/components/form/register-form";
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
  title: "Create account",
  description:
    "Create a Dwellio account to find your next home or manage your properties.",
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto flex w-full max-w-xl justify-center px-4 py-12 sm:px-6 lg:py-16">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Register as a tenant, owner, or manager to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
