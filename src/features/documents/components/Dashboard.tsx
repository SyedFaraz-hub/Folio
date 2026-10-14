"use client";

import { useState, useSyncExternalStore } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Plus, Upload } from "lucide-react";

import { Button, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { ImportDialog } from "@/features/import";
import { firstName, greeting } from "@/lib/format";

import { useCreateDocument, useDocuments } from "../hooks";
import { filterDocuments, parseFilter } from "../lib";
import type { DocumentFilter } from "../types";
import { DocCard } from "./DocCard";
import { DocTable } from "./DocTable";
import { EmptyState } from "./EmptyState";

const SECTION_TITLE: Record<DocumentFilter, string> = {
  all: "All documents",
  owned: "My documents",
  shared: "Shared with me",
};

/** Greeting uses the viewer's local clock, not the server's. */
const subscribeNoop = () => () => {};
function useGreeting() {
  return useSyncExternalStore(
    subscribeNoop,
    () => greeting(),
    () => "Hello",
  );
}

export function Dashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = parseFilter(searchParams.get("filter"));

  const { data, isError, refetch } = useDocuments();
  const create = useCreateDocument();
  const [importOpen, setImportOpen] = useState(false);
  const hello = useGreeting();

  const docs = data ? filterDocuments(data, filter) : [];
  const recent = docs.slice(0, 4);

  const setFilter = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-5 py-3">
        <span className="text-sm text-muted-foreground">Home</span>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Upload />} onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button
            icon={<Plus strokeWidth={2.4} />}
            loading={create.isPending}
            onClick={() => create.mutate({})}
          >
            New document
          </Button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-9 px-[clamp(16px,4vw,40px)] py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 text-[30px] font-semibold tracking-[-0.025em]">
            {hello}, {firstName(userName)}
          </h1>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList aria-label="Filter documents">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="owned">Owned</TabsTrigger>
              <TabsTrigger value="shared">Shared with me</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isError ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-card border border-destructive-border bg-destructive-soft px-3 py-2.5 text-[13px] text-destructive-text"
          >
            Couldn’t load your documents.
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        {data && docs.length === 0 ? (
          <EmptyState
            filter={filter}
            creating={create.isPending}
            onCreate={() => create.mutate({})}
            onImport={() => setImportOpen(true)}
          />
        ) : null}

        {recent.length ? (
          <section className="flex flex-col gap-3.5">
            <h2 className="m-0 text-[13px] font-medium text-muted-foreground">Jump back in</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))] gap-4">
              {recent.map((doc) => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        ) : null}

        {docs.length ? (
          <section className="flex flex-col gap-1.5">
            <h2 className="m-0 mb-2 text-[13px] font-medium text-muted-foreground">
              {SECTION_TITLE[filter]}
            </h2>
            <DocTable docs={docs} />
          </section>
        ) : null}
      </div>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
