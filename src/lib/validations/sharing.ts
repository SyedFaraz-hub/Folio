import { z } from "zod";

export const shareRoleSchema = z.enum(["viewer", "editor"]);

export const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter an email address.")
    .email("Enter a valid email address."),
  role: shareRoleSchema,
});

export const updateShareSchema = z.object({ role: shareRoleSchema });

export type InviteInput = z.input<typeof inviteSchema>;
