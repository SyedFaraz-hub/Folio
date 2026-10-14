import type { NextRequest } from "next/server";

import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { removeShare, updateShare } from "@/lib/documents";
import { readJson, route } from "@/lib/http";
import { updateShareSchema } from "@/lib/validations";

type Ctx = RouteContext<"/api/documents/[id]/shares/[userId]">;

export const PATCH = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id, userId } = await ctx.params;
  const { role } = updateShareSchema.parse(await readJson(req));
  return Response.json(await updateShare(await getDb(), user.id, id, userId, role));
});

export const DELETE = route(async (_req: NextRequest, ctx: Ctx) => {
  const user = await requireUser();
  const { id, userId } = await ctx.params;
  return Response.json(await removeShare(await getDb(), user.id, id, userId));
});
