"use client";

import * as React from "react";

import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

interface DropzoneProps {
  accept: string;
  hint: string;
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

/** Dashed violet drop target that also opens the native file picker. */
export function Dropzone({ accept, hint, onFile, disabled, className }: DropzoneProps) {
  const inputId = React.useId();
  const [dragging, setDragging] = React.useState(false);

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && !disabled) onFile(file);
      }}
      className={cn(
        "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-panel border-[1.5px] border-dashed border-brand-dash bg-brand-wash p-6 text-center transition-colors",
        "focus-within:border-brand has-[:focus-visible]:shadow-[0_0_0_3px_rgba(91,75,245,0.18)]",
        dragging && "border-brand bg-brand-soft",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-card border border-border bg-background text-brand shadow-[0_4px_12px_-4px_rgba(91,75,245,0.3)]">
        <Upload className="size-5" />
      </span>
      <span className="text-[15px] font-medium">
        Drop a file or{" "}
        <span className="text-brand-text underline underline-offset-[3px]">browse</span>
      </span>
      <span className="font-mono text-xs text-muted-foreground">{hint}</span>
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
