"use client";

import { ChevronRight, Loader2 } from "lucide-react";

import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

import { useSignIn } from "../hooks";
import type { Account } from "../types";

export function AccountPicker({ accounts, next }: { accounts: Account[]; next?: string }) {
  const signIn = useSignIn(next);
  const pendingEmail = signIn.isPending ? signIn.variables : null;

  return (
    <div className="flex flex-col gap-0.5 rounded-panel border border-border bg-background p-1.5 shadow-popover">
      {accounts.map((account, i) => (
        <button
          key={account.id}
          type="button"
          disabled={signIn.isPending}
          onClick={() => signIn.mutate(account.email)}
          className={cn(
            "flex min-h-[60px] items-center gap-3 rounded-[11px] px-3 text-left text-foreground transition-colors hover:bg-sidebar disabled:cursor-wait",
            i === 0 && "bg-sidebar",
          )}
        >
          <Avatar initials={account.initials} tone={account.tone} size="lg" />
          <span className="flex min-w-0 flex-1 flex-col gap-px">
            <span className="text-[15px] font-medium">{account.name}</span>
            <span className="truncate font-mono text-xs text-muted-foreground">
              {account.email}
            </span>
          </span>
          {pendingEmail === account.email ? (
            <Loader2
              className="size-4 animate-spin text-muted-foreground"
              aria-label="Signing in"
            />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          )}
        </button>
      ))}
      {accounts.length === 0 ? (
        <p className="m-0 p-4 text-sm text-muted-foreground">
          No accounts yet. Run <code className="font-mono">npm run db:setup</code> to seed the demo
          users.
        </p>
      ) : null}
    </div>
  );
}
