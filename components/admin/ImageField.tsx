"use client";

import { type ChangeEvent, useRef, useState, useTransition } from "react";
import { uploadImageAction } from "@/app/admin/(panel)/actions";

const MAX_SIDE = 1600;

/** Shrinks the picked image in the browser (max 1600px, WebP) so uploads stay small. */
async function compress(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp") return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export default function ImageField({
  name,
  label,
  defaultValue,
  folder,
  uploadsEnabled,
  error,
  hint,
  onChange,
}: {
  name: string;
  label: string;
  defaultValue: string;
  folder: "avatar" | "projects";
  uploadsEnabled: boolean;
  error?: string;
  hint?: string;
  onChange?: () => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploadError, setUploadError] = useState("");
  const [uploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError("");
    startUpload(async () => {
      try {
        const data = new FormData();
        data.set("file", await compress(file));
        data.set("folder", folder);
        const result = await uploadImageAction(data);
        if (result.url) {
          setValue(result.url);
          onChange?.();
        } else setUploadError(result.error ?? "Upload failed.");
      } catch {
        setUploadError("Couldn't read that image. Try a JPG, PNG or WebP.");
      }
    });
  };

  return (
    <div className="field image-field" data-field={name}>
      <span>{label}</span>
      <div className="image-row">
        <div className="image-preview">
          {value ? <img src={value} alt="" /> : <span className="mono">no image</span>}
        </div>
        <div className="image-controls">
          <input
            name={name}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onChange?.();
            }}
            placeholder="/photo.webp"
            aria-label={`${label} path`}
          />
          <div className="image-buttons">
            {uploadsEnabled && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload image"}
              </button>
            )}
            {value && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setValue("");
                  onChange?.();
                }}
              >
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPick} />
        </div>
      </div>
      {hint && <small className="field-hint">{hint}</small>}
      {(uploadError || error) && <small className="field-error">{uploadError || error}</small>}
    </div>
  );
}
