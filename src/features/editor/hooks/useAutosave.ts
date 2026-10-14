"use client";

import { useCallback, useEffect, useRef } from "react";

import { useQueryClient } from "@tanstack/react-query";
import type { Editor } from "@tiptap/react";

import { patchListCache } from "@/features/documents/hooks";
import { updateDocument } from "@/features/documents/services";
import { useEditorStore } from "@/stores/editor-store";

const DEBOUNCE_MS = 800;

/**
 * Debounced autosave. At most one request is in flight; edits made meanwhile trigger exactly one
 * follow-up save with the latest content. Last write wins on the server (no merge).
 */
export function useAutosave(editor: Editor | null, documentId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const dirty = useRef(false);
  // Always points at the latest save implementation (so timers/listeners never go stale).
  const saveRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    const { setStatus, markSaved } = useEditorStore.getState();

    saveRef.current = async () => {
      if (!editor || !enabled) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      if (inFlight.current) {
        dirty.current = true; // picked up when the current request finishes
        return;
      }

      inFlight.current = true;
      dirty.current = false;
      setStatus("saving");
      let failed = false;
      try {
        const doc = await updateDocument(documentId, { content: editor.getJSON() });
        markSaved(doc.updatedAt, doc.lastEditedBy);
        patchListCache(queryClient, doc);
      } catch (err) {
        failed = true;
        dirty.current = true;
        setStatus("error", err instanceof Error ? err.message : "Couldn’t save");
      } finally {
        inFlight.current = false;
        if (dirty.current && !failed) void saveRef.current();
      }
    };

    if (!editor || !enabled) return;
    const onUpdate = () => {
      dirty.current = true;
      setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void saveRef.current(), DEBOUNCE_MS);
    };
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      // Flush pending edits when leaving the page (e.g. back to Home).
      if (dirty.current) void saveRef.current();
    };
  }, [editor, enabled, documentId, queryClient]);

  // Warn before closing with unsaved changes; flush when the tab is hidden.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current || inFlight.current) e.preventDefault();
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden" && dirty.current) void saveRef.current();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, []);

  const retry = useCallback(() => void saveRef.current(), []);
  return { retry };
}
