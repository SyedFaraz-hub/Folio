"use client";

import type { Editor } from "@tiptap/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

const OPTIONS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
] as const;

type BlockType = (typeof OPTIONS)[number]["value"];

export function currentBlockType(editor: Editor): BlockType {
  for (const level of [1, 2, 3] as const) {
    if (editor.isActive("heading", { level })) return `h${level}`;
  }
  return "paragraph";
}

export function BlockTypeSelect({
  editor,
  value,
  disabled,
}: {
  editor: Editor;
  value: BlockType;
  disabled?: boolean;
}) {
  const apply = (next: string) => {
    const chain = editor.chain().focus();
    if (next === "paragraph") chain.setParagraph().run();
    else chain.setHeading({ level: Number(next.slice(1)) as 1 | 2 | 3 }).run();
  };

  return (
    <Select value={value} onValueChange={apply} disabled={disabled}>
      <SelectTrigger aria-label="Text style" className="h-[34px] w-[118px] px-2.5">
        <SelectValue />
      </SelectTrigger>
      <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
