"use client";

import { useCallback, useState } from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { FileText, Home, Search, Users } from "lucide-react";

import { Logo } from "@/components/ui";
import {
  SearchDialog,
  TONE_DOT,
  accessTone,
  filterDocuments,
  useDocuments,
  useSearchShortcut,
} from "@/features/documents";
import type { SessionUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { UserCard } from "./UserCard";

function NavItem({
  href,
  icon,
  label,
  active,
  trailing,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-toggle px-2.5 text-sm font-medium no-underline transition-colors [&_svg]:size-4",
        active
          ? "bg-background text-foreground shadow-[0_1px_2px_rgba(15,15,18,0.06)]"
          : "text-subtle-foreground hover:bg-background/60",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {trailing}
    </Link>
  );
}

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const filter = useSearchParams().get("filter");
  const { data } = useDocuments();
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchShortcut(useCallback(() => setSearchOpen(true), []));

  const recent = data ? filterDocuments(data, "all").slice(0, 3) : [];
  const onHome = pathname === "/";

  return (
    <nav
      aria-label="Workspace"
      className="flex max-w-full flex-[1_1_232px] flex-col gap-5 px-2 py-3 md:sticky md:top-2 md:h-[calc(100dvh-16px)] md:max-w-[260px]"
    >
      <Link
        href="/"
        className="flex h-10 items-center gap-2.5 rounded-control px-2 text-[15px] font-semibold text-foreground no-underline"
      >
        <Logo />
        Folio
      </Link>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-9 items-center gap-2 rounded-control border border-border bg-background px-2.5 text-sm text-muted-foreground shadow-panel hover:border-[#d6d6dc]"
      >
        <Search className="size-[15px]" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded-md border border-border bg-sidebar px-1.5 py-0.5 font-mono text-[11px] font-medium">
          ⌘K
        </kbd>
      </button>

      <div className="flex flex-col gap-0.5">
        <NavItem
          href="/"
          icon={<Home strokeWidth={1.9} />}
          label="Home"
          active={onHome && !filter}
        />
        <NavItem
          href="/?filter=owned"
          icon={<FileText strokeWidth={1.9} />}
          label="My documents"
          active={onHome && filter === "owned"}
          trailing={
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {data?.owned.length ?? ""}
            </span>
          }
        />
        <NavItem
          href="/?filter=shared"
          icon={<Users strokeWidth={1.9} />}
          label="Shared with me"
          active={onHome && filter === "shared"}
          trailing={
            data?.shared.length ? (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-[5px] text-[11px] font-semibold text-white">
                {data.shared.length}
              </span>
            ) : null
          }
        />
      </div>

      {recent.length ? (
        <div className="flex flex-col gap-0.5">
          <span className="px-2.5 pb-1.5 text-xs font-medium text-muted-foreground">Recent</span>
          {recent.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              prefetch={false}
              className="flex h-[34px] items-center gap-2.5 rounded-toggle px-2.5 text-sm text-subtle-foreground no-underline hover:bg-background/60"
            >
              <span
                className="size-1.5 shrink-0 rounded-[2px]"
                style={{ background: TONE_DOT[accessTone(doc)] }}
              />
              <span className="truncate">{doc.title}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <UserCard user={user} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}
