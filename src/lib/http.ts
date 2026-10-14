import { ZodError } from "zod";

/**
 * Error shape returned by every API route:
 *   { error: { code, message, field?, issues? } }
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

export const unauthorized = () => new ApiError(401, "unauthorized", "Sign in to continue.");
export const notFound = (what = "Document") => new ApiError(404, "not_found", `${what} not found.`);
export const forbidden = (message = "You don't have permission to do that.") =>
  new ApiError(403, "forbidden", message);

export function errorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json(
      { error: { code: err.code, message: err.message, field: err.field } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return Response.json(
      {
        error: {
          code: "invalid_input",
          message: first?.message ?? "Invalid input.",
          field: first?.path.join("."),
          issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
      },
      { status: 400 },
    );
  }
  console.error("[api] unhandled error", err);
  return Response.json(
    { error: { code: "internal", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}

/** Wraps a route handler so thrown ApiError/ZodError become consistent JSON responses. */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

/** Parses a JSON body, turning malformed JSON into a 400 instead of a 500. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  }
}
