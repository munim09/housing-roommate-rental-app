"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authKeys, useLogin } from "@/hooks";
import { DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { ROLE_HOME, saveSession } from "@/lib/session";
import { USER_ROLE_LABELS, type UserRole } from "@/types";
import type { LoginValues } from "@/validation";
import { loginSchema } from "@/validation";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
    ArrowRightIcon,
    Building2Icon,
    EyeIcon,
    EyeOffIcon,
    ShieldCheckIcon,
    UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ROLE_ICONS: Record<UserRole, typeof UserRoundIcon> = {
    ADMIN: ShieldCheckIcon,
    OWNER: Building2Icon,
    MANAGER: UserRoundIcon,
    TENANT: UserRoundIcon,
};

export function LoginForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const login = useLogin();

    // useApiErrorToast(login.error, "Could not sign in");

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        } satisfies LoginValues,
        validators: {
            onSubmit: loginSchema,
        },
        onSubmit: async ({ value }) => {
            console.log("value", value);
            login.mutate(value, {
                onSuccess: (res) => {
                    console.log("res", res);
                    if (!res.success) {
                        toast.add({
                            title: "Server Failure",
                            description:
                                "Something went wrong. Please try again",
                            type: "error",
                        });
                        return;
                    }
                    const result = res.data;
                    saveSession(
                        result.user,
                        result.accessToken,
                        (result as any).refreshToken,
                    );
                    const user = result.user;
                    queryClient.setQueryData(authKeys.session, user);
                    toast.add({
                        title: `Welcome back, ${user.name.split(" ")[0]}`,
                        description: `Signed in as ${USER_ROLE_LABELS[user.role].toLowerCase()}.`,
                        type: "success",
                    });
                    if (user.role === "ADMIN") {
                        router.replace("/admin");
                    } else {
                        console.log("user.role", user.role);
                        console.log(
                            "ROLE_HOME[user.role]",
                            ROLE_HOME[user.role],
                        );
                        router.replace(ROLE_HOME[user.role]);
                    }
                },
                onError: (err) => {
                    console.log("error", err);
                    toast.add({
                        title: "Login failure",
                        description:
                            err.message ||
                            "Something went wrong. Please try again",
                        type: "error",
                    });
                },
            });
        },
    });

    // Demo accounts fill the form and submit it, so the visible fields always
    // match the credentials that were actually sent.
    function loginAs(account: (typeof DEMO_ACCOUNTS)[number]) {
        form.setFieldValue("email", account.email);
        form.setFieldValue("password", account.password);
        void form.handleSubmit();
    }

    const pendingEmail = login.isPending ? login.variables?.email : undefined;

    return (
        <div className="grid gap-8">
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
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
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
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    onBlur={field.handleBlur}
                                    aria-invalid={
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    }
                                    className="h-11"
                                />
                                {field.state.meta.isTouched &&
                                !field.state.meta.isValid ? (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                ) : null}
                            </Field>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <Field
                                data-invalid={
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid
                                }
                            >
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={field.state.value}
                                        onChange={(event) =>
                                            field.handleChange(
                                                event.target.value,
                                            )
                                        }
                                        onBlur={field.handleBlur}
                                        aria-invalid={
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        }
                                        className="h-11 pe-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current,
                                            )
                                        }
                                        className="absolute inset-y-0 end-0 flex w-10 items-center justify-center rounded-e-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOffIcon
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <EyeIcon
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>
                                {field.state.meta.isTouched &&
                                !field.state.meta.isValid ? (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                ) : null}
                            </Field>
                        )}
                    </form.Field>

                    <Button type="submit" size="lg" disabled={login.isPending}>
                        {login.isPending ? <Spinner /> : null}
                        Sign in
                        {login.isPending ? null : (
                            <ArrowRightIcon aria-hidden="true" />
                        )}
                    </Button>

                    <p className="text-sm text-muted-foreground">
                        New to Dwellio?{" "}
                        <Button
                            variant="link"
                            size="sm"
                            nativeButton={false}
                            render={<Link href="/register" />}
                        >
                            Create an account
                        </Button>
                    </p>
                </div>
            </form>

            <div className="grid gap-4">
                <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Quick demo login
                    </span>
                    <Separator className="flex-1" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {DEMO_ACCOUNTS.map((account) => {
                        const Icon = ROLE_ICONS[account.role];
                        const isPending = pendingEmail === account.email;

                        return (
                            <Button
                                key={account.role}
                                variant="outline"
                                className="h-auto justify-start gap-3 px-3 py-3 text-start"
                                disabled={login.isPending}
                                onClick={() => loginAs(account)}
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {isPending ? (
                                        <Spinner />
                                    ) : (
                                        <Icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    )}
                                </span>
                                <span className="grid gap-0.5">
                                    <span className="text-sm font-medium">
                                        {USER_ROLE_LABELS[account.role]}
                                    </span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {account.email}
                                    </span>
                                </span>
                            </Button>
                        );
                    })}
                </div>

                <p className="text-xs text-muted-foreground">
                    Demo accounts come from the backend seed. Each one signs in
                    through the real{" "}
                    <code className="font-mono">POST /login</code> route and
                    lands on that role&rsquo;s dashboard.
                </p>
            </div>
        </div>
    );
}
