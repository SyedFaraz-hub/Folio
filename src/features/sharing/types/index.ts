import type { PersonRef } from "@/features/documents/types";
import type { ShareRole } from "@/lib/db/schema";

export type { ShareRole } from "@/lib/db/schema";

export interface ShareEntry {
  user: PersonRef;
  role: ShareRole;
}

export interface DocumentAccessList {
  owner: PersonRef;
  shares: ShareEntry[];
}
