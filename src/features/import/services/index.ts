import { ApiClientError } from "@/lib/api-client";

import type { ImportResult } from "../types";

/**
 * Uploads a file to /api/import with XHR (fetch can't report upload progress) and
 * resolves with the parsed editor content.
 */
export function uploadForImport(
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/import");
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      // Reserve the last 10% for server-side parsing.
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
    };
    xhr.onload = () => {
      const body = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve(body as ImportResult);
      } else {
        reject(
          new ApiClientError(
            xhr.status,
            body?.error?.code ?? "import_failed",
            body?.error?.message ?? "We couldn’t import this file.",
            body?.error?.field,
          ),
        );
      }
    };
    xhr.onerror = () =>
      reject(new ApiClientError(0, "network", "Upload failed. Check your connection and retry."));
    signal?.addEventListener("abort", () => xhr.abort());

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
