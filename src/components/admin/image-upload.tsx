"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

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
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - value.length;
    const chosen = Array.from(files).slice(0, room);
    if (chosen.length === 0) {
      toast(`Max ${max} images`, "error");
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of chosen) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok) uploaded.push(json.data.url);
        else toast(json.error ?? "Upload failed", "error");
      } catch {
        toast("Upload failed", "error");
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-4/5 w-24 overflow-hidden rounded-button border border-border"
          >
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-4/5 w-24 flex-col items-center justify-center gap-1 rounded-button border border-dashed border-border text-text-muted hover:border-ink hover:text-ink"
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Upload className="size-5" />
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
        Up to {max} images. First image is the cover.
      </p>
    </div>
  );
}
