"use client";

import { useState } from "react";

import type { JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { useEditor } from "@tiptap/react";

import { TooltipProvider } from "@/components/ui";
import type { DocumentDetail } from "@/features/documents/types";
import { ImportDialog } from "@/features/import";
import { ShareDialog } from "@/features/sharing";
import { can } from "@/lib/access";
import { useEditorStore } from "@/stores/editor-store";

import { useAutosave } from "../hooks/useAutosave";
import { documentExtensions } from "../lib/extensions";
import { DocFooter } from "./DocFooter";
import { EditorHeader } from "./EditorHeader";
import { PageCanvas } from "./PageCanvas";
import { Toolbar } from "./Toolbar";

export function EditorView({ doc, currentUserId }: { doc: DocumentDetail; currentUserId: string }) {
  const canEdit = can(doc.access, "edit");
  const [title, setTitle] = useState(doc.title);
  const [shareOpen, setShareOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Initialise the save/footer state for this document before first paint.
  useState(() => useEditorStore.getState().reset(doc.updatedAt, doc.lastEditedBy));

  const editor = useEditor({
    extensions: [
      ...documentExtensions,
      Placeholder.configure({
        placeholder: canEdit ? "Start writing…" : "This document is empty.",
      }),
    ],
    content: doc.content,
    editable: canEdit,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "folio-prose min-h-[420px]",
        "aria-label": "Document body",
        ...(canEdit ? {} : { "aria-readonly": "true" }),
      },
    },
  });

  const { retry } = useAutosave(editor, doc.id, canEdit);

  const insertImported = (content: JSONContent) => {
    editor
      ?.chain()
      .focus("end")
      .insertContent(content.content ?? [])
      .run();
  };

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex min-h-dvh flex-col bg-background">
        <EditorHeader
          doc={doc}
          title={title}
          onTitleChange={setTitle}
          onShare={() => setShareOpen(true)}
          onRetrySave={retry}
        />
        {editor ? (
          <Toolbar
            editor={editor}
            readOnly={!canEdit}
            onImport={canEdit ? () => setImportOpen(true) : undefined}
          />
        ) : (
          <div className="h-[47px] border-b border-divider bg-toolbar" />
        )}
        <PageCanvas editor={editor} doc={doc} title={title} />
        {editor ? <DocFooter editor={editor} currentUserId={currentUserId} /> : null}
      </div>

      {can(doc.access, "share") ? (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          documentId={doc.id}
          title={title}
          currentUserId={currentUserId}
        />
      ) : null}
      {canEdit ? (
        <ImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onInsert={insertImported}
          defaultMode="draft"
        />
      ) : null}
    </TooltipProvider>
  );
}
