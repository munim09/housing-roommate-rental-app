"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useRegister } from "@/hooks";
import { USER_ROLE_LABELS, type UserRole } from "@/types";
import { registerSchema } from "@/validation";

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: "TENANT", label: USER_ROLE_LABELS.TENANT },
  { value: "OWNER", label: USER_ROLE_LABELS.OWNER },
  { value: "MANAGER", label: USER_ROLE_LABELS.MANAGER },
];

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  // useApiErrorToast(register.error, "Could not create account");

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "TENANT" as "TENANT" | "OWNER" | "MANAGER",
      phone: "",
    } as any,
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      register.mutate(value as any, {
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
            title: "Registration successful",
            description:
              "OTP sent to your email. It will be valid for 50 minutes.",
            type: "success",
          });
          router.replace(
            `/verify-email?email=${encodeURIComponent(res.data.email)}`,
          );
        },
        onError: (err) => {
          toast.add({
            title: "Registration failure",
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
        <form.Field name="name">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="John Doe"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

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
                placeholder="you@example.com"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="01234567890"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
                className="h-11"
              />
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="role">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select<UserRole>
                value={field.state.value}
                onValueChange={(next) => {
                  if (
                    next &&
                    (next === "OWNER" ||
                      next === "MANAGER" ||
                      next === "TENANT")
                  )
                    field.handleChange(next as any);
                }}
              >
                <SelectTrigger
                  id="role"
                  className="h-11 w-full"
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Field
              data-invalid={
                field.state.meta.isTouched && !field.state.meta.isValid
              }
            >
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                  className="h-11 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {field.state.meta.isTouched && !field.state.meta.isValid ? (
                <FieldError errors={field.state.meta.errors} />
              ) : null}
            </Field>
          )}
        </form.Field>

        <Button type="submit" size="lg" disabled={register.isPending}>
          {register.isPending ? <Spinner /> : null}
          Create account
          {register.isPending ? null : <ArrowRightIcon aria-hidden="true" />}
        </Button>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </p>
      </div>
    </form>
  );
}
