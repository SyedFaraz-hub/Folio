import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deleteDocument, getDocument, updateDocument } from "@/lib/documents";
import { readJson, route } from "@/lib/http";
import { updateDocumentSchema } from "@/lib/validations";

type Ctx = RouteContext<"/api/documents/[id]">;

export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  return Response.json({ document: await getDocument(await getDb(), user.id, id) });
});

export const PATCH = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const input = updateDocumentSchema.parse(await readJson(req));
  return Response.json({ document: await updateDocument(await getDb(), user.id, id, input) });
});

export const DELETE = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  await deleteDocument(await getDb(), user.id, id);
  return new Response(null, { status: 204 });
});
