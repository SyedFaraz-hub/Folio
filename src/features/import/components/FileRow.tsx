import { Check, X } from "lucide-react";

import { Progress } from "@/components/ui";
import { cn } from "@/lib/utils";
import { extensionOf } from "@/lib/validations";

import type { ImportItem } from "../types";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileRow({ item, onDismiss }: { item: ImportItem; onDismiss: () => void }) {
  const ext = extensionOf(item.file.name).slice(1).toUpperCase().slice(0, 4) || "FILE";
  const isError = item.status === "error";

  return (
    <div
      role={isError ? "alert" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-card border px-3 py-2.5",
        isError ? "border-destructive-border bg-destructive-soft" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[9px] font-mono text-[10px] font-semibold",
          isError
            ? "border border-destructive-border bg-background text-destructive-text"
            : "bg-brand-soft text-brand-text",
        )}
      >
        {ext}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-[7px] text-[13px]">
        <span className="flex justify-between gap-2">
          <span className="truncate font-medium">{item.file.name}</span>
          {item.status === "uploading" ? (
            <span className="font-mono text-muted-foreground">{item.progress}%</span>
          ) : item.status === "ready" ? (
            <span className="flex items-center gap-1 text-success-text">
              <Check className="size-3.5" strokeWidth={2.8} /> Ready
            </span>
          ) : null}
        </span>
        {item.status === "uploading" ? <Progress value={item.progress} /> : null}
        {item.status === "ready" ? (
          <span className="-mt-1 truncate text-xs text-muted-foreground">
            {formatSize(item.file.size)} · will open as “{item.result.title}”
          </span>
        ) : null}
        {item.status === "error" ? (
          <span className="-mt-1.5 text-destructive-text">{item.error}</span>
        ) : null}
      </span>

      {item.status !== "uploading" ? (
        <button
          type="button"
          aria-label={`Dismiss ${item.file.name}`}
          onClick={onDismiss}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-toggle",
            isError
              ? "text-[#8f1d22] hover:bg-destructive-border/50"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <X className="size-3.5" strokeWidth={2.2} />
        </button>
      ) : null}
    </div>
  );
}
