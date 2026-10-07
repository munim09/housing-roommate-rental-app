"use client";

import type { MeResponse, UpdateProfilePayload } from "@/api/profile.api";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateProfile } from "@/hooks/profile.hook";
import { toApiError } from "@/lib/api-client";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const profileSchema = z.object({
    nid: z.string().trim().max(50, "NID must be under 50 characters"),

    address: z.string().trim().max(200, "Address must be under 200 characters"),

    occupation: z
        .string()
        .trim()
        .max(50, "Occupation must be under 50 characters"),
});
export type ProfileValues = z.infer<typeof profileSchema>;
export function ProfileForm({ me }: { me: MeResponse }) {
    const update = useUpdateProfile();

    const form = useForm({
        defaultValues: {
            nid:
                me.tenantProfile?.nid ??
                me.ownerProfile?.nid ??
                me.managerProfile?.nid ??
                "",

            address:
                me.tenantProfile?.address ??
                me.ownerProfile?.address ??
                me.managerProfile?.address ??
                "",

            occupation:
                me.tenantProfile?.occupation ??
                me.ownerProfile?.occupation ??
                me.managerProfile?.occupation ??
                "",
        } satisfies ProfileValues,

        validators: {
            onSubmit: profileSchema,
        },

        onSubmit: async ({ value }) => {
            const payload: UpdateProfilePayload = {
                nid: value.nid.trim() ? value.nid.trim() : null,
                address: value.address.trim() ? value.address.trim() : null,
                occupation: value.occupation.trim()
                    ? value.occupation.trim()
                    : null,
            };

            try {
                const res = await update.mutateAsync(payload);

                if (res.success) {
                    toast.add({
                        title: "Profile updated",
                        type: "success",
                    });

                    form.reset();
                } else {
                    toast.add({
                        title: "Update failed",
                        description: res.message,
                        type: "error",
                    });
                }
            } catch (error) {
                const e = toApiError(error);

                toast.add({
                    title: "Update failed",
                    description: e.message,
                    type: "error",
                });
            }
        },
    });
    return (
        <form
            //   className="grid gap-4 max-w-xl"
            className="mx-auto grid w-full max-w-xl gap-4"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
            }}
        >
            <form.Field name="nid">
                {(field) => (
                    <Field
                        data-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        }
                    >
                        <FieldLabel htmlFor="nid">NID</FieldLabel>
                        <Input
                            id="nid"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                    </Field>
                )}
            </form.Field>
            <form.Field name="address">
                {(field) => (
                    <Field
                        data-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        }
                    >
                        <FieldLabel htmlFor="address">Address</FieldLabel>
                        <Textarea
                            id="address"
                            rows={3}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                    </Field>
                )}
            </form.Field>
            <form.Field name="occupation">
                {(field) => (
                    <Field
                        data-invalid={
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        }
                    >
                        <FieldLabel htmlFor="occupation">Occupation</FieldLabel>
                        <Input
                            id="occupation"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                        <FieldError errors={field.state.meta.errors} />
                    </Field>
                )}
            </form.Field>
            <Button type="submit" disabled={update.isPending}>
                {update.isPending ? <Spinner /> : null}
                Save changes
            </Button>
        </form>
    );
}
