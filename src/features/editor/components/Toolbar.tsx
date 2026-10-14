"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Redo2, Underline, Undo2, Upload } from "lucide-react";

import { ToolbarButton, ToolbarDivider } from "@/components/ui";

import { BlockTypeSelect, currentBlockType } from "./BlockTypeSelect";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl+";

export function Toolbar({
  editor,
  readOnly,
  onImport,
}: {
  editor: Editor;
  readOnly: boolean;
  onImport?: () => void;
}) {
  // Re-render only when the formatting state under the cursor changes.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      block: currentBlockType(e),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const run = (fn: (chain: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) =>
    fn(editor.chain().focus()).run();

  return (
    <div className="flex border-b border-divider bg-toolbar px-4 py-1.5">
      <div
        role="toolbar"
        aria-label="Formatting"
        aria-disabled={readOnly || undefined}
        className="flex flex-1 flex-wrap items-center gap-0.5"
      >
        <ToolbarButton
          label="Undo"
          shortcut={`${mod}Z`}
          disabled={readOnly || !state.canUndo}
          onClick={() => run((c) => c.undo())}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          shortcut={`${mod}⇧Z`}
          disabled={readOnly || !state.canRedo}
          onClick={() => run((c) => c.redo())}
        >
          <Redo2 />
        </ToolbarButton>
        <ToolbarDivider />
        <BlockTypeSelect editor={editor} value={state.block} disabled={readOnly} />
        <ToolbarDivider />
        <ToolbarButton
          label="Bold"
          shortcut={`${mod}B`}
          pressed={state.bold}
          disabled={readOnly}
          onClick={() => run((c) => c.toggleBold())}
        >
          <Bold strokeWidth={2.6} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          shortcut={`${mod}I`}
          pressed={state.italic}
          disabled={readOnly}
          onClick={() => run((c) => c.toggleItalic())}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          shortcut={`${mod}U`}
          pressed={state.underline}
          disabled={readOnly}
          onClick={() => run((c) => c.toggleUnderline())}
        >
          <Underline />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="Bulleted list"
          shortcut={`${mod}⇧8`}
          pressed={state.bulletList}
          disabled={readOnly}
          onClick={() => run((c) => c.toggleBulletList())}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          shortcut={`${mod}⇧7`}
          pressed={state.orderedList}
          disabled={readOnly}
          onClick={() => run((c) => c.toggleOrderedList())}
        >
          <ListOrdered />
        </ToolbarButton>
        {onImport ? (
          <>
            <ToolbarDivider />
            <ToolbarButton
              label="Import a file into this document"
              shape="wide"
              disabled={readOnly}
              onClick={onImport}
            >
              <Upload className="!size-[15px]" />
              Import
            </ToolbarButton>
          </>
        ) : null}
      </div>
    </div>
  );
}
