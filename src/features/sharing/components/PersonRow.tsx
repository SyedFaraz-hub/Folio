"use client";

import { Avatar } from "@/components/ui";
import type { PersonRef } from "@/features/documents/types";

export function PersonRow({
  person,
  isYou,
  children,
}: {
  person: PersonRef;
  isYou?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 rounded-control px-2">
      <Avatar initials={person.initials} tone={person.tone} size="md" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">
          {person.name}{" "}
          {isYou ? <span className="font-normal text-muted-foreground">(you)</span> : null}
        </span>
        <span className="truncate font-mono text-xs text-muted-foreground">{person.email}</span>
      </span>
      {children}
    </div>
  );
}
