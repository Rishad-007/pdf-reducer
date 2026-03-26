"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type CompressionMode = "HIGH" | "MIDIUM" | "LOW";

const MODE_OPTIONS: Array<{ value: CompressionMode; description: string }> = [
  { value: "HIGH", description: "Smallest size, lowest visual quality" },
  { value: "MIDIUM", description: "Balanced size and quality" },
  { value: "LOW", description: "Larger size, higher visual quality" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressionMode>("MIDIUM");
  const [isCompressing, setIsCompressing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fileInfo = useMemo(() => {
    if (!file) {
      return "No file selected";
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return `${file.name} (${sizeInMb} MB)`;
  }, [file]);

  async function onCompress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setIsCompressing(true);
    setStatus("Uploading and compressing PDF...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      const response = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Compression failed.");
      }

      const blob = await response.blob();
      const outputName = file.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = outputName;
      anchor.click();
      URL.revokeObjectURL(url);

      setStatus("Compression completed. Download started.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while compressing.";
      setError(message);
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.headerBlock}>
          <p className={styles.eyebrow}>PDF Tools</p>
          <h1>Reduce PDF size in one click</h1>
          <p className={styles.subtitle}>
            Upload your PDF, choose a compression mode, and download the
            optimized file.
          </p>
        </div>

        <form className={styles.card} onSubmit={onCompress}>
          <label className={styles.label} htmlFor="pdf-upload">
            Upload PDF
          </label>
          <input
            id="pdf-upload"
            name="file"
            type="file"
            accept="application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <p className={styles.fileInfo}>{fileInfo}</p>

          <fieldset className={styles.modeGroup}>
            <legend>Compression Mode</legend>
            {MODE_OPTIONS.map((option) => (
              <label key={option.value} className={styles.radioRow}>
                <input
                  type="radio"
                  name="mode"
                  value={option.value}
                  checked={mode === option.value}
                  onChange={() => setMode(option.value)}
                />
                <span>
                  <strong>{option.value}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <button type="submit" disabled={isCompressing || !file}>
            {isCompressing ? "Compressing..." : "Compress and Download"}
          </button>

          {status ? <p className={styles.status}>{status}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </main>
    </div>
  );
}
