"use client";

import { DragEvent, FormEvent, useMemo, useState } from "react";
import { FaFacebookF, FaGithub, FaInstagram } from "react-icons/fa";
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
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fileSizeLabel = useMemo(() => {
    if (!file) {
      return "";
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return `${sizeInMb} MB`;
  }, [file]);

  function updateSelectedFile(nextFile: File | null) {
    setError("");
    setStatus("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.type !== "application/pdf") {
      setFile(null);
      setError("Only PDF files are supported.");
      return;
    }

    setFile(nextFile);
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    updateSelectedFile(droppedFile);
  }

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
      <div className={styles.bgGlow} />
      <main className={styles.main}>
        <section id="home" className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Rishad Nur's</p>
            <h1>Free PDF Size Reducer</h1>
            <h2>Upload, reduce PDF file size, and download instantly.</h2>
            <p className={styles.subtitle}>
              Rishad&apos;s PDF Reducer helps you freely upload and compress PDF
              files without complicated steps. Reduce PDF size for email,
              websites, forms, and fast sharing while keeping readable output.
            </p>
            <div className={styles.heroStats}>
              <p>
                <strong>100% Free</strong>
                <span>No login required</span>
              </p>
              <p>
                <strong>3 Modes</strong>
                <span>High, medium, and low compression</span>
              </p>
              <p>
                <strong>Quick Download</strong>
                <span>Get your optimized PDF in seconds</span>
              </p>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.rings} />
            <div className={styles.pill}>PDF</div>
            <div className={styles.tagA}>Fast</div>
            <div className={styles.tagB}>Reducer</div>
            <div className={styles.tagC}>Online</div>
          </div>
        </section>

        <section id="compress" className={styles.sectionCard}>
          <form className={styles.card} onSubmit={onCompress}>
            <h3>Compress your PDF now</h3>
            <p className={styles.label}>Upload PDF file</p>
            <label
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
              htmlFor="pdf-upload"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <span className={styles.dropBadge}>PDF FILE</span>
              <span className={styles.dropTitle}>
                Drag and drop your PDF here
              </span>
              <span className={styles.dropHint}>
                or click to select from your device
              </span>
            </label>
            <input
              id="pdf-upload"
              name="file"
              type="file"
              accept="application/pdf"
              className={styles.fileInput}
              onChange={(event) =>
                updateSelectedFile(event.target.files?.[0] ?? null)
              }
            />
            {file ? (
              <div className={styles.previewCard}>
                <span className={styles.previewBadge}>PDF</span>
                <div className={styles.previewMeta}>
                  <p className={styles.previewName}>{file.name}</p>
                  <p className={styles.previewSize}>{fileSizeLabel} selected</p>
                </div>
                <button
                  type="button"
                  className={styles.removeFileButton}
                  onClick={() => updateSelectedFile(null)}
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className={styles.fileInfo}>No file selected yet.</p>
            )}

            <fieldset className={styles.modeGroup}>
              <legend>Choose compression mode</legend>
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

            <button
              type="submit"
              className={styles.ctaButton}
              disabled={isCompressing || !file}
            >
              {isCompressing ? "Compressing PDF..." : "Compress and Download"}
            </button>

            {status ? <p className={styles.status}>{status}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
          </form>
        </section>

        <section id="features" className={styles.features}>
          <article>
            <h3>Smart compression</h3>
            <p>
              Reduce large PDF files for better upload speed and lower storage
              use.
            </p>
          </article>
          <article>
            <h3>Clean user experience</h3>
            <p>
              Modern interface designed for desktop and mobile with simple,
              guided actions.
            </p>
          </article>
          <article>
            <h3>Built for sharing</h3>
            <p>
              Create smaller PDF documents that are easier to send and publish
              online.
            </p>
          </article>
        </section>

        <section id="faq" className={styles.faq}>
          <h3>Frequently asked questions</h3>
          <p>
            Can I reduce PDF file size for free? Yes. Rishad&apos;s PDF Reducer
            is free to use.
          </p>
          <p>
            Is this an online PDF compressor? Yes. Upload your PDF, choose a
            mode, and download the optimized file.
          </p>
        </section>
      </main>

      <footer id="contact" className={styles.footer}>
        <p>Built by Rishad</p>
        <div className={styles.socials}>
          <a
            href="https://github.com/Rishad-007"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
            <span>GitHub</span>
          </a>
          <a
            href="https://facebook.com/rishad.nur"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
            <span>Facebook</span>
          </a>
          <a
            href="https://instagram.com/rishad.nur"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
            <span>Instagram</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
