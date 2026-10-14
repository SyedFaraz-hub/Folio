"use client";

import { Avatar } from "@/components/ui";
import { useSignOut } from "@/features/auth";
import type { SessionUser } from "@/lib/auth";

export function UserCard({ user }: { user: SessionUser }) {
  const signOut = useSignOut();
  return (
    <div className="mt-auto flex items-center gap-2.5 px-2.5 py-2">
      <Avatar initials={user.initials} tone={user.tone} size="sm" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </span>
      <button
        type="button"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
        className="text-xs font-medium text-brand-text hover:text-[#2e1fb0] disabled:opacity-50"
      >
        Switch
      </button>
    </div>
  );
}
