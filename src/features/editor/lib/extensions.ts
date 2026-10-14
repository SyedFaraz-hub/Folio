import StarterKit from "@tiptap/starter-kit";

/**
 * The document schema. Shared by the browser editor and the server-side importer so imported
 * HTML is normalised to exactly what the editor can render (unsupported markup is dropped).
 * StarterKit v3 includes bold, italic, underline, headings, lists, links, undo/redo, etc.
 */
export const documentExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } },
  }),
];

export const HEADING_LEVELS = [1, 2, 3] as const;
