import { SignJWT, jwtVerify } from "jose";

/**
 * Session token helpers. Edge-safe (no DB, no next/headers) so proxy.ts can use them too.
 * Auth is intentionally mocked: seeded accounts sign in without a password.
 */
export const SESSION_COOKIE = "folio_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const DEV_SECRET = "folio-dev-secret-do-not-use-in-production-0123456789";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
    return new TextEncoder().encode(DEV_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
