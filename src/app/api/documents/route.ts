import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createDocument, listDocuments } from "@/lib/documents";
import { readJson, route } from "@/lib/http";
import { createDocumentSchema } from "@/lib/validations";

export const GET = route(async () => {
  const user = await requireUser();
  return Response.json(await listDocuments(await getDb(), user.id));
});

export const POST = route(async (req: Request) => {
  const user = await requireUser();
  const input = createDocumentSchema.parse(await readJson(req));
  const document = await createDocument(await getDb(), user.id, input);
  return Response.json({ document }, { status: 201 });
});
