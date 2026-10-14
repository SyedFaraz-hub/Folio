import { eq } from "drizzle-orm";

import { startSession } from "@/lib/auth";
import { getDb, users } from "@/lib/db";
import { ApiError, readJson, route } from "@/lib/http";
import { loginSchema } from "@/lib/validations";

/** Mocked sign-in: any seeded account, no password. */
export const POST = route(async (req: Request) => {
  const { email } = loginSchema.parse(await readJson(req));
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new ApiError(404, "user_not_found", `No account uses ${email}.`, "email");

  await startSession(user.id);
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      initials: user.initials,
      tone: user.tone,
    },
  });
});
