"use client";

import { useState } from "react";

import type { JSONContent } from "@tiptap/core";
import { toast } from "sonner";

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  Dropzone,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useCreateDocument } from "@/features/documents/hooks";
import { IMPORT_ACCEPT, IMPORT_HINT } from "@/lib/validations";

import { useImportQueue } from "../hooks";
import type { ImportMode } from "../types";
import { FileRow } from "./FileRow";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided (editor with edit access), enables "Into current draft". */
  onInsert?: (content: JSONContent) => void;
  defaultMode?: ImportMode;
}

export function ImportDialog({ open, onOpenChange, onInsert, defaultMode }: ImportDialogProps) {
  const [mode, setMode] = useState<ImportMode>(defaultMode ?? (onInsert ? "draft" : "new"));
  const queue = useImportQueue();
  const create = useCreateDocument();

  const close = (next: boolean) => {
    if (!next) queue.reset();
    onOpenChange(next);
  };

  const confirm = () => {
    const ready = queue.ready;
    if (!ready || ready.status !== "ready") return;
    const { result } = ready;

    if (mode === "draft" && onInsert) {
      onInsert(result.content);
      toast.success(`Inserted ${result.filename}`);
      close(false);
      return;
    }
    create.mutate(
      { title: result.title, content: result.content, importedFrom: result.filename },
      { onSuccess: () => close(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        title="Import a file"
        description="Upload a .txt, .md or .docx file up to 2 MB."
        className="max-w-[540px]"
      >
        <DialogBody>
          {onInsert ? (
            <Tabs value={mode} onValueChange={(v) => setMode(v as ImportMode)}>
              <TabsList size="lg" aria-label="Import destination">
                <TabsTrigger value="new">As a new document</TabsTrigger>
                <TabsTrigger value="draft">Into current draft</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}

          <Dropzone accept={IMPORT_ACCEPT} hint={IMPORT_HINT} onFile={queue.add} />

          {queue.items.length ? (
            <div className="flex flex-col gap-2" aria-live="polite">
              {queue.items.map((item) => (
                <FileRow key={item.id} item={item} onDismiss={() => queue.dismiss(item.id)} />
              ))}
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!queue.ready || queue.uploading}
            loading={create.isPending}
            onClick={confirm}
          >
            {mode === "draft" && onInsert ? "Insert into draft" : "Create document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
