"use client";

import { Check, CloudOff, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui";
import { useEditorStore } from "@/stores/editor-store";

export function SaveBadge({ onRetry, readOnly }: { onRetry: () => void; readOnly: boolean }) {
  const status = useEditorStore((s) => s.saveStatus);
  const error = useEditorStore((s) => s.saveError);

  if (readOnly)
    return (
      <Badge tone="private" size="lg">
        View only
      </Badge>
    );

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5" role="status">
        <Badge tone="destructive" size="lg" title={error ?? undefined}>
          <CloudOff /> Not saved
        </Badge>
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-medium text-brand-text hover:underline"
        >
          Retry
        </button>
      </span>
    );
  }

  if (status === "saving" || status === "dirty") {
    return (
      <Badge tone="private" size="lg" role="status">
        <Loader2 className="animate-spin" /> Saving…
      </Badge>
    );
  }

  return (
    <Badge tone="success" size="lg" role="status">
      <Check strokeWidth={2.8} /> Saved
    </Badge>
  );
}
