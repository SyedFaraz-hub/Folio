"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  Button,
  FieldError,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { inviteSchema } from "@/lib/validations";

import { useInvite } from "../hooks";

type FormIn = z.input<typeof inviteSchema>;
type FormOut = z.output<typeof inviteSchema>;

export function InviteForm({ documentId }: { documentId: string }) {
  const invite = useInvite(documentId);
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "editor" },
  });
  const error = form.formState.errors.email?.message;

  const onSubmit = form.handleSubmit((values) =>
    invite.mutateAsync(values).then(
      (list) => {
        const person = list.shares.find((s) => s.user.email === values.email)?.user;
        toast.success(`Shared with ${person?.name ?? values.email}`);
        form.reset({ email: "", role: values.role });
      },
      (err: unknown) => {
        const message = err instanceof Error ? err.message : "Couldn’t share this document.";
        if (err instanceof ApiClientError && err.field === "email") {
          form.setError("email", { message }, { shouldFocus: true });
        } else {
          toast.error(message);
        }
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="m-0 flex flex-col gap-2 px-6 pt-4">
      <div
        className={cn(
          "flex min-h-11 items-center gap-1.5 rounded-card border border-border py-1 pr-1 pl-3 transition-[border-color,box-shadow]",
          "focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(91,75,245,0.18)]",
          error &&
            "border-[#e5484d] shadow-[0_0_0_3px_rgba(229,72,77,0.12)] focus-within:border-[#e5484d] focus-within:shadow-[0_0_0_3px_rgba(229,72,77,0.12)]",
        )}
      >
        <label htmlFor="invite-email" className="sr-only">
          Invite by email
        </label>
        <input
          id="invite-email"
          type="email"
          autoFocus
          autoComplete="off"
          placeholder="Add people by email"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "invite-error" : undefined}
          className="h-[34px] min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          {...form.register("email")}
        />
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger variant="filled" aria-label="Permission">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="editor">Can edit</SelectItem>
                <SelectItem value="viewer">Can view</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <Button
          type="submit"
          variant="brand"
          size="sm"
          className="h-[34px] rounded-[9px] px-3.5"
          loading={invite.isPending}
        >
          Invite
        </Button>
      </div>
      <FieldError id="invite-error">{error}</FieldError>
    </form>
  );
}
