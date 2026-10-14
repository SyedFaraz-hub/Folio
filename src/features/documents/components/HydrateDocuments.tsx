"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { documentKeys } from "../hooks";
import type { DocumentList } from "../types";

/** Seeds the React Query cache with the server-rendered list before any consumer mounts. */
export function HydrateDocuments({
  data,
  children,
}: {
  data: DocumentList;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  useState(() => queryClient.setQueryData(documentKeys.list(), data));
  return <>{children}</>;
}
