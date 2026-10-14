import { create } from "zustand";

import type { PersonRef } from "@/features/documents/types";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface EditorState {
  saveStatus: SaveStatus;
  saveError: string | null;
  lastEditedAt: string | null;
  lastEditedBy: PersonRef | null;
  setStatus: (status: SaveStatus, error?: string | null) => void;
  markSaved: (at: string, by: PersonRef | null) => void;
  reset: (at: string, by: PersonRef | null) => void;
}

/** UI state for the open document's save lifecycle (header badge + footer). */
export const useEditorStore = create<EditorState>()((set) => ({
  saveStatus: "idle",
  saveError: null,
  lastEditedAt: null,
  lastEditedBy: null,
  setStatus: (saveStatus, saveError = null) => set({ saveStatus, saveError }),
  markSaved: (lastEditedAt, lastEditedBy) =>
    set({ saveStatus: "saved", saveError: null, lastEditedAt, lastEditedBy }),
  reset: (lastEditedAt, lastEditedBy) =>
    set({ saveStatus: "idle", saveError: null, lastEditedAt, lastEditedBy }),
}));

export const selectSaveStatus = (s: EditorState) => s.saveStatus;
