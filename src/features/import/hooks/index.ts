"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { validateImportFile } from "@/lib/validations";

import { uploadForImport } from "../services";
import type { ImportItem } from "../types";

/** Tracks the files dropped into the import dialog: progress, parse result or error. */
export function useImportQueue() {
  const [items, setItems] = useState<ImportItem[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const update = (id: string, next: ImportItem) =>
    setItems((list) => list.map((item) => (item.id === id ? next : item)));

  const add = useCallback((file: File) => {
    const id = crypto.randomUUID();
    const problem = validateImportFile(file);

    // A new file replaces the current (non-error) one; error rows stay until dismissed.
    setItems((list) => {
      for (const item of list) {
        if (item.status === "uploading") controllers.current.get(item.id)?.abort();
      }
      const errors = list.filter((i) => i.status === "error");
      return [
        ...errors,
        problem
          ? { id, file, status: "error", error: problem }
          : { id, file, status: "uploading", progress: 0 },
      ];
    });
    if (problem) return;

    const controller = new AbortController();
    controllers.current.set(id, controller);
    uploadForImport(
      file,
      (progress) => update(id, { id, file, status: "uploading", progress }),
      controller.signal,
    )
      .then((result) => update(id, { id, file, status: "ready", result }))
      .catch((err: Error) => {
        if (!controller.signal.aborted)
          update(id, { id, file, status: "error", error: err.message });
      })
      .finally(() => controllers.current.delete(id));
  }, []);

  const dismiss = useCallback(
    (id: string) => setItems((list) => list.filter((item) => item.id !== id)),
    [],
  );

  const reset = useCallback(() => {
    controllers.current.forEach((c) => c.abort());
    controllers.current.clear();
    setItems([]);
  }, []);

  useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  const ready = items.find((i) => i.status === "ready");
  const uploading = items.some((i) => i.status === "uploading");
  return { items, add, dismiss, reset, ready, uploading };
}
