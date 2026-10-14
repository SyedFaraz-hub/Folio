import { Suspense } from "react";

import { Dashboard } from "@/features/documents";
import { requireUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await requireUser();
  return (
    <Suspense>
      <Dashboard userName={user.name} />
    </Suspense>
  );
}
