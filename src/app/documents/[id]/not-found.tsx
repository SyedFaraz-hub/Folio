import Link from "next/link";

import { FileX } from "lucide-react";

import { Button } from "@/components/ui";

export default function DocumentNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sidebar p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-panel border border-border bg-background px-8 py-10 text-center shadow-card">
        <span className="flex size-11 items-center justify-center rounded-card bg-muted text-muted-foreground">
          <FileX className="size-5" />
        </span>
        <h1 className="m-0 text-lg font-semibold tracking-[-0.02em]">Document not available</h1>
        <p className="m-0 text-sm text-muted-foreground">
          It may have been deleted, or the owner hasn’t shared it with you.
        </p>
        <Button asChild className="mt-2">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
