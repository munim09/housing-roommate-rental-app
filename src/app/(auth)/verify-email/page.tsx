import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/form/verify-email-form";
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
  title: "Verify email",
  description: "Verify your email to complete registration.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  const params = await searchParams;
  const email = firstValue(params.email);

  if (!email) {
    redirect("/register");
  }

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto flex w-full max-w-xl justify-center px-4 py-12 sm:px-6 lg:py-16">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Verify your email</CardTitle>
                <CardDescription>
                  We&apos;ve sent an OTP to {email}. Enter it below to complete
                  your registration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VerifyEmailForm email={email} />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
