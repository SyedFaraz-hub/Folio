"use client";

import { useState } from "react";

import Link from "next/link";

import { Link2, Lock, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  ConfirmModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useDeleteDocument } from "@/features/documents/hooks";
import type { DocumentDetail } from "@/features/documents/types";
import { can } from "@/lib/access";

import { SaveBadge } from "./SaveBadge";
import { TitleInput } from "./TitleInput";

interface EditorHeaderProps {
  doc: DocumentDetail;
  title: string;
  onTitleChange: (title: string) => void;
  onShare: () => void;
  onRetrySave: () => void;
}

export function EditorHeader({
  doc,
  title,
  onTitleChange,
  onShare,
  onRetrySave,
}: EditorHeaderProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useDeleteDocument();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn’t copy the link");
    }
  };

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-divider px-4 py-2.5">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-[1_1_320px] items-center gap-1.5 text-sm"
      >
        <Link
          href="/"
          className="rounded-toggle px-2 py-1.5 text-muted-foreground no-underline hover:bg-muted"
        >
          Home
        </Link>
        <span aria-hidden className="text-[#b4b5be]">
          /
        </span>
        <TitleInput
          documentId={doc.id}
          title={title}
          onTitleChange={onTitleChange}
          canRename={can(doc.access, "rename")}
        />
        <SaveBadge onRetry={onRetrySave} readOnly={!can(doc.access, "edit")} />
      </nav>

      <div className="flex items-center gap-2.5">
        {can(doc.access, "share") ? (
          <Button variant="brand" icon={<Lock strokeWidth={2.2} />} onClick={onShare}>
            Share
          </Button>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More options"
              className="text-subtle-foreground"
            >
              <MoreHorizontal className="!size-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={copyLink}>
              <Link2 /> Copy link
            </DropdownMenuItem>
            {can(doc.access, "delete") ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem tone="destructive" onSelect={() => setConfirmDelete(true)}>
                  <Trash2 /> Delete document
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this document?"
        description={`“${title}” will be permanently deleted for you and everyone it’s shared with.`}
        confirmLabel="Delete"
        isLoading={remove.isPending}
        onConfirm={() => remove.mutate(doc.id)}
      />
    </header>
  );
}
