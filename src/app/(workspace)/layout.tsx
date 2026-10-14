import { Suspense } from "react";

import { redirect } from "next/navigation";

import { HydrateDocuments } from "@/features/documents";
import { AppSidebar } from "@/layout";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listDocuments } from "@/lib/documents";

export default async function WorkspaceLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const documents = await listDocuments(await getDb(), user.id);

  return (
    <HydrateDocuments data={documents}>
      <div className="flex min-h-dvh flex-wrap items-start gap-2 bg-sidebar p-2">
        <Suspense>
          <AppSidebar user={user} />
        </Suspense>
        <main className="flex min-h-[calc(100dvh-16px)] min-w-0 flex-[999_1_560px] flex-col rounded-panel border border-border bg-background shadow-panel">
          {children}
        </main>
      </div>
    </HydrateDocuments>
  );
}
