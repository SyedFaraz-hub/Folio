import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { asc } from "drizzle-orm";

import { AccountPicker, LoginHero } from "@/features/auth";
import { getCurrentUser } from "@/lib/auth";
import { getDb, users } from "@/lib/db";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  if (await getCurrentUser()) redirect("/");

  const { next } = await props.searchParams;
  const db = await getDb();
  const accounts = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      initials: users.initials,
      tone: users.tone,
    })
    .from(users)
    .orderBy(asc(users.createdAt), asc(users.email));

  return (
    <div className="flex min-h-dvh flex-wrap gap-2 bg-sidebar p-2">
      <LoginHero />
      <main className="flex flex-[1_1_480px] items-center justify-center p-[clamp(28px,5vw,64px)]">
        <div className="flex w-full max-w-[400px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-[26px] font-semibold tracking-[-0.03em]">Choose an account</h2>
            <p className="m-0 text-[15px] leading-normal text-muted-foreground">
              No password needed. Switch accounts to see how sharing looks from the other side.
            </p>
          </div>
          <AccountPicker accounts={accounts} next={typeof next === "string" ? next : undefined} />
          <p className="m-0 text-[13px] leading-normal text-muted-foreground">
            Sessions are mocked with a signed cookie; there is no real authentication in this build.
          </p>
        </div>
      </main>
    </div>
  );
}
