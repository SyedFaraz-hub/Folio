import type { JSONContent } from "@tiptap/core";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "4m ago", "1h ago", "Yesterday", "Oct 11" */
export function relativeTime(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = now.getTime() - d.getTime();
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/** Concatenated plain text of a Tiptap document. */
export function plainText(node: JSONContent | null | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  const parts = (node.content ?? []).map(plainText);
  return parts.join(node.type === "doc" ? "\n" : " ");
}

export function wordCount(text: string): number {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

export function readingTime(words: number): string {
  return `${Math.max(1, Math.round(words / 230))} min read`;
}
