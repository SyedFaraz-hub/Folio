import type { JSONContent } from "@tiptap/core";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { ApiError } from "./http";
import { parseImport } from "./import";

const enc = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;
const types = (doc: JSONContent) => (doc.content ?? []).map((n) => n.type);
const marksIn = (doc: JSONContent): string[] =>
  (doc.content ?? []).flatMap((n) => [...(n.marks ?? []).map((m) => m.type), ...marksIn(n)]);

describe("parseImport()", () => {
  it("turns .txt blank-line blocks into paragraphs and keeps line breaks", async () => {
    const { title, content } = await parseImport(
      "notes.txt",
      enc("First line\nsecond line\n\nNext para"),
    );
    expect(title).toBe("notes");
    expect(types(content)).toEqual(["paragraph", "paragraph"]);
    expect(content.content?.[0].content?.map((n) => n.type)).toEqual(["text", "hardBreak", "text"]);
  });

  it("maps Markdown structure to editor nodes and promotes a leading H1 to the title", async () => {
    const md = [
      "# Q4 onboarding plan",
      "",
      "## Goals",
      "",
      "Ship a **small** change and own a *real* feature.",
      "",
      "- one",
      "- two",
      "",
      "1. first",
      "2. second",
    ].join("\n");
    const { title, content } = await parseImport("draft.md", enc(md));

    expect(title).toBe("Q4 onboarding plan");
    expect(types(content)).toEqual(["heading", "paragraph", "bulletList", "orderedList"]);
    expect(content.content?.[0].attrs?.level).toBe(2);
    expect(marksIn(content)).toEqual(expect.arrayContaining(["bold", "italic"]));
  });

  it("drops raw HTML embedded in Markdown, block and inline, keeping ordinary inline text", async () => {
    const md = [
      "Hello",
      "",
      "<script>alert(1)</script>",
      "",
      'Inline <script>alert("x")</script> end, <style>p{}</style>and <b>kept</b>.',
      "",
      "- item <script>steal()</script> ok",
      "",
      "`<script>shown as code</script>`",
    ].join("\n");
    const json = JSON.stringify((await parseImport("x.md", enc(md))).content);
    expect(json).not.toContain("alert");
    expect(json).not.toContain("steal");
    expect(json).not.toContain("p{}");
    expect(json).toContain("kept");
    expect(json).toContain("shown as code");
  });

  it("converts a real .docx, keeping headings, bold/italic/underline and both list types", async () => {
    const bytes = readFileSync(join(__dirname, "../test/fixtures/sample.docx"));
    const { title, content } = await parseImport(
      "Hiring rubric v3.docx",
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    );
    expect(title).toBe("Hiring rubric v3");
    expect(types(content)).toEqual(["heading", "paragraph", "bulletList", "orderedList"]);
    expect(marksIn(content)).toEqual(expect.arrayContaining(["bold", "italic", "underline"]));
  });

  it.each([
    ["Roadmap.pdf", enc("%PDF-1.7"), "unsupported_file", /PDF isn’t supported/],
    ["empty.txt", enc(""), "unsupported_file", /empty/],
    ["big.md", new ArrayBuffer(2 * 1024 * 1024 + 1), "unsupported_file", /larger than 2 MB/],
    ["fake.docx", enc("not a zip"), "unreadable_file", /damaged/],
    ["binary.txt", new Uint8Array([104, 0, 105]).buffer, "unreadable_file", /text file/],
  ])("rejects %s", async (name, bytes, code, message) => {
    const err = await parseImport(name, bytes as ArrayBuffer).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, code });
    expect((err as ApiError).message).toMatch(message);
  });
});
