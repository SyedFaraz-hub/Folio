import { apiFetch, json } from "@/lib/api-client";

import type { Account } from "../types";

export const signIn = (email: string) =>
  apiFetch<{ user: Account }>("/api/auth/login", { method: "POST", body: json({ email }) });

export const signOut = () => apiFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
