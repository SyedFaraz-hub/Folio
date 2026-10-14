import type { JSONContent } from "@tiptap/core";
import { generateJSON } from "@tiptap/html/server";
import mammoth from "mammoth";
import { Marked } from "marked";
import "server-only";

import { documentExtensions } from "@/features/editor/lib/extensions";

import { ApiError } from "./http";
import { extensionOf, titleFromFilename, validateImportFile } from "./validations/import";

export interface ParsedImport {
  title: string;
  content: JSONContent;
}

// Raw HTML inside Markdown is dropped rather than trusted.
const markdown = new Marked({ gfm: true, breaks: false, renderer: { html: () => "" } });

const EMPTY: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * Converts an uploaded .txt / .md / .docx into Tiptap JSON.
 * Everything goes through the editor's own schema, so the result is always editable.
 */
export async function parseImport(filename: string, bytes: ArrayBuffer): Promise<ParsedImport> {
  const problem = validateImportFile({ name: filename, size: bytes.byteLength });
  if (problem) throw new ApiError(400, "unsupported_file", problem, "file");

  const ext = extensionOf(filename);
  let content: JSONContent;
  if (ext === ".docx") content = await fromDocx(bytes);
  else if (ext === ".md") content = fromHtml(await markdown.parse(decodeText(bytes)));
  else content = fromPlainText(decodeText(bytes));

  return promoteTitle(content, titleFromFilename(filename));
}

function decodeText(bytes: ArrayBuffer): string {
  const text = new TextDecoder("utf-8").decode(bytes).replace(/^﻿/, "");
  if (text.includes("\u0000")) {
    throw new ApiError(400, "unreadable_file", "This doesn’t look like a text file.", "file");
  }
  return text.replace(/\r\n?/g, "\n");
}

function fromHtml(html: string): JSONContent {
  const json = generateJSON(html, documentExtensions) as JSONContent;
  return json.content?.length ? json : EMPTY;
}

/** Blank lines separate paragraphs; single newlines become hard breaks. */
export function fromPlainText(text: string): JSONContent {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.replace(/^\n+|\n+$/g, ""))
    .filter((block) => block.trim().length > 0)
    .map<JSONContent>((block) => ({
      type: "paragraph",
      content: block.split("\n").flatMap<JSONContent>((line, i) => {
        const nodes: JSONContent[] = i > 0 ? [{ type: "hardBreak" }] : [];
        if (line.length) nodes.push({ type: "text", text: line });
        return nodes;
      }),
    }));
  return paragraphs.length ? { type: "doc", content: paragraphs } : EMPTY;
}

async function fromDocx(bytes: ArrayBuffer): Promise<JSONContent> {
  const buffer = Buffer.from(bytes);
  // .docx is a zip archive; reject anything else before handing it to mammoth.
  if (buffer.subarray(0, 2).toString("latin1") !== "PK") {
    throw new ApiError(400, "unreadable_file", "This .docx file looks damaged.", "file");
  }
  try {
    const { value } = await mammoth.convertToHtml({ buffer });
    return fromHtml(value);
  } catch {
    throw new ApiError(400, "unreadable_file", "We couldn’t read this .docx file.", "file");
  }
}

/** If the document opens with a level-1 heading, use it as the title instead of the filename. */
function promoteTitle(content: JSONContent, fallback: string): ParsedImport {
  const [first, ...rest] = content.content ?? [];
  if (first?.type === "heading" && first.attrs?.level === 1) {
    const title = (first.content ?? [])
      .map((n) => n.text ?? "")
      .join("")
      .trim()
      .slice(0, 200);
    if (title) {
      return { title, content: rest.length ? { ...content, content: rest } : EMPTY };
    }
  }
  return { title: fallback, content };
}
