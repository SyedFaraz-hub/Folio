import { requireUser } from "@/lib/auth";
import { ApiError, route } from "@/lib/http";
import { parseImport } from "@/lib/import";
import { MAX_IMPORT_BYTES } from "@/lib/validations";

export const runtime = "nodejs";

/**
 * Parse-only: converts an uploaded file to editor JSON and returns it.
 * The client then either creates a new document or inserts it into the open draft,
 * so both import modes share one code path and permission checks stay on the document routes.
 */
export const POST = route(async (req: Request) => {
  await requireUser();

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_IMPORT_BYTES + 64 * 1024) {
    throw new ApiError(413, "file_too_large", "This file is larger than 2 MB.", "file");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, "invalid_upload", "Upload a file using multipart/form-data.", "file");
  }
  const file = form.get("file");
  if (!(file instanceof File))
    throw new ApiError(400, "missing_file", "Choose a file to import.", "file");

  const parsed = await parseImport(file.name, await file.arrayBuffer());
  return Response.json({ ...parsed, filename: file.name });
});
