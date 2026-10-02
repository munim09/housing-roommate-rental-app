"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useVerifyEmail } from "@/hooks";
import { verifyEmailSchema } from "@/validation";

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const verifyEmail = useVerifyEmail();

  // useApiErrorToast(verifyEmail.error, "Could not verify email");

  const form = useForm({
    defaultValues: {
      email,
      otp: "",
    },
    validators: {
      onSubmit: verifyEmailSchema,
    },
    onSubmit: async ({ value }) => {
      verifyEmail.mutate(value, {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: "Something went wrong. Please try again",
              type: "error",
            });
            return;
          }
          toast.add({
            title: "Email verified",
            description: "Your account is active. You can now sign in.",
            type: "success",
          });
          router.replace("/login");
        },
        onError: (err) => {
          toast.add({
            title: "Verification failure",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      });
    },
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-5">
        <form.Field name="email">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
                readOnly
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="otp">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="otp">OTP Code</FieldLabel>
              <Input
                id="otp"
                name="otp"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={field.state.value}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");
                  field.handleChange(value);
                }}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
                autoComplete="one-time-code"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <Button type="submit" size="lg" disabled={verifyEmail.isPending}>
          {verifyEmail.isPending ? <Spinner /> : null}
          Verify Email
          {verifyEmail.isPending ? null : <ArrowRightIcon aria-hidden="true" />}
        </Button>
      </div>
    </form>
  );
}
