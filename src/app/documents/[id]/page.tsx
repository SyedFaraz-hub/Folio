import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { EditorView } from "@/features/editor";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getDocument } from "@/lib/documents";
import { ApiError } from "@/lib/http";

async function load(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/documents/${id}`);
  try {
    return { user, doc: await getDocument(await getDb(), user.id, id) };
  } catch (err) {
    // Unknown id, malformed id, or no access: all look the same to the viewer.
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata(props: PageProps<"/documents/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { doc } = await load(id);
  return { title: doc.title };
}

export default async function DocumentPage(props: PageProps<"/documents/[id]">) {
  const { id } = await props.params;
  const { user, doc } = await load(id);
  return <EditorView key={doc.id} doc={doc} currentUserId={user.id} />;
}
