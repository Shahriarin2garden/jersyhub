"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { deliveryUrl } from "@/lib/cloudinary-url";

const MAX_BYTES = 5 * 1024 * 1024;

type Signature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export function ImageUpload({
  value,
  onChange,
  max = 6,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const toast = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [configError, setConfigError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const room = max - value.length;
    if (room <= 0) {
      toast(`Maximum ${max} images`, "error");
      return;
    }

    // Rejected here rather than after the transfer. Sending a 20MB file across
    // a Bangladeshi mobile connection only to be told it was too large wastes
    // the admin's data and their time.
    const chosen: File[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!file.type.startsWith("image/")) {
        toast(`${file.name} is not an image`, "error");
      } else if (file.size > MAX_BYTES) {
        toast(`${file.name} is over 5MB`, "error");
      } else {
        chosen.push(file);
      }
    }
    if (chosen.length === 0) return;

    setUploading(true);
    try {
      const sigRes = await fetch("/api/admin/upload", { method: "POST" });
      const sigJson = await sigRes.json();
      if (!sigRes.ok) {
        // A 503 means Cloudinary is unconfigured — a standing condition, not a
        // transient failure, so it stays on screen instead of in a toast that
        // disappears after four seconds.
        if (sigRes.status === 503) setConfigError(sigJson.error);
        else toast(sigJson.error ?? "Could not start upload", "error");
        return;
      }
      setConfigError(null);
      const sig: Signature = sigJson.data;

      // Uploaded in parallel: six images serially is six full round trips to
      // Cloudinary end to end.
      const results = await Promise.all(
        chosen.map((file) => uploadOne(file, sig)),
      );

      const uploaded = results.filter((r): r is string => r !== null);
      const failed = results.length - uploaded.length;
      if (failed > 0) toast(`${failed} image(s) failed to upload`, "error");
      if (uploaded.length) onChange([...value, ...uploaded]);
    } catch {
      toast("Upload failed. Check your connection and try again.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div className="space-y-3">
      {configError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-button border border-destructive/40 bg-destructive-light p-3 text-sm text-destructive"
        >
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{configError}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-4/5 w-24 overflow-hidden rounded-button border border-border"
          >
            <Image
              src={deliveryUrl(url, 192)}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remove image"
              className="absolute right-0 top-0 flex size-11 items-center justify-center"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-black/60 text-white">
                <X className="size-3" />
              </span>
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-4/5 w-24 flex-col items-center justify-center gap-1 rounded-button border border-dashed border-border text-text-muted hover:border-ink hover:text-ink disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 aria-hidden className="size-5 animate-spin" />
            ) : (
              <>
                <Upload aria-hidden className="size-5" />
                <span className="text-xs">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-text-muted">
        Up to {max} images, 5MB each. First image is the cover.
      </p>
    </div>
  );
}

/** POST one file straight to Cloudinary. Returns the stored URL, or null. */
async function uploadOne(file: File, sig: Signature): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("folder", sig.folder);
  fd.append("signature", sig.signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: "POST", body: fd },
    );
    const json = await res.json();
    if (!res.ok) {
      console.error("Cloudinary upload failed", json?.error?.message ?? json);
      return null;
    }
    return json.secure_url as string;
  } catch (e) {
    console.error("Cloudinary upload failed", e);
    return null;
  }
}
