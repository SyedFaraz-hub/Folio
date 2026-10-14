import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listShares, shareDocument } from "@/lib/documents";
import { readJson, route } from "@/lib/http";
import { inviteSchema } from "@/lib/validations";

type Ctx = RouteContext<"/api/documents/[id]/shares">;

export const GET = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  return Response.json(await listShares(await getDb(), user.id, id));
});

export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const input = inviteSchema.parse(await readJson(req));
  return Response.json(await shareDocument(await getDb(), user.id, id, input), { status: 201 });
});
