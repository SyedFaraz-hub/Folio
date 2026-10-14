/** Shared by the import dialog (client-side pre-check) and /api/import (authoritative). */
export const IMPORT_EXTENSIONS = [".txt", ".md", ".docx"] as const;
export type ImportExtension = (typeof IMPORT_EXTENSIONS)[number];

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const IMPORT_ACCEPT = IMPORT_EXTENSIONS.join(",");
export const IMPORT_HINT = ".txt · .md · .docx — up to 2 MB";

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function isImportExtension(ext: string): ext is ImportExtension {
  return (IMPORT_EXTENSIONS as readonly string[]).includes(ext);
}

/** Returns a user-facing error message, or null when the file can be imported. */
export function validateImportFile(file: { name: string; size: number }): string | null {
  const ext = extensionOf(file.name);
  if (!isImportExtension(ext)) {
    const label = ext ? ext.slice(1).toUpperCase() : "This file type";
    return `${label} isn’t supported. Save as .docx, .md or .txt and retry.`;
  }
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_IMPORT_BYTES) return "This file is larger than 2 MB.";
  return null;
}

/** "Q4 plan.final.md" → "Q4 plan.final" */
export function titleFromFilename(filename: string): string {
  const ext = extensionOf(filename);
  const base = ext ? filename.slice(0, -ext.length) : filename;
  return base.trim().slice(0, 200) || "Imported document";
}
