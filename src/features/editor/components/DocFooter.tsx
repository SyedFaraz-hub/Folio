"use client";

import { type Editor, useEditorState } from "@tiptap/react";

import { readingTime, relativeTime, wordCount } from "@/lib/format";
import { useEditorStore } from "@/stores/editor-store";

export function DocFooter({ editor, currentUserId }: { editor: Editor; currentUserId: string }) {
  const words = useEditorState({ editor, selector: ({ editor: e }) => wordCount(e.getText()) });
  const at = useEditorStore((s) => s.lastEditedAt);
  const by = useEditorStore((s) => s.lastEditedBy);

  return (
    <footer className="flex flex-wrap justify-between gap-2 border-t border-divider px-5 py-2.5 font-mono text-xs text-muted-foreground">
      <span>
        {words} {words === 1 ? "word" : "words"} · {readingTime(words)}
      </span>
      {at ? (
        <span suppressHydrationWarning>
          Last edited by {by ? (by.id === currentUserId ? "you" : by.name) : "someone"} ·{" "}
          {relativeTime(at)}
        </span>
      ) : null}
    </footer>
  );
}
