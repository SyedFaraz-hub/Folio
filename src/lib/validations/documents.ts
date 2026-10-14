import { z } from "zod";

export const TITLE_MAX = 200;
export const CONTENT_MAX_BYTES = 1_000_000;
export const UNTITLED = "Untitled document";

export const titleSchema = z
  .string()
  .trim()
  .min(1, "Title can't be empty.")
  .max(TITLE_MAX, `Keep the title under ${TITLE_MAX} characters.`);

/** Tiptap/ProseMirror JSON. Structure is enforced by the editor schema; we bound shape + size. */
export const docContentSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .passthrough()
  .refine((value) => JSON.stringify(value).length <= CONTENT_MAX_BYTES, {
    message: "This document is too large to save (1 MB limit).",
  });

export const createDocumentSchema = z.object({
  title: titleSchema.optional(),
  content: docContentSchema.optional(),
  importedFrom: z.string().trim().max(255).optional(),
});

export const updateDocumentSchema = z
  .object({ title: titleSchema.optional(), content: docContentSchema.optional() })
  .refine((v) => v.title !== undefined || v.content !== undefined, {
    message: "Nothing to update.",
  });

export type CreateDocumentInput = z.input<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.input<typeof updateDocumentSchema>;
