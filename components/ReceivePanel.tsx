// components/ReceivePanel.tsx
"use client";

import { useState, useRef } from "react";

type ReceiveState = "idle" | "loading" | "done" | "error";

interface MessageResult {
  type: "text" | "image" | "pdf" | "file";
  content?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  viewUrl?: string;
  downloadUrl?: string;
  expiresAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime?: string) {
  if (!mime) return "📎";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("audio/")) return "🎵";
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar")) return "🗜️";
  return "📄";
}

export default function ReceivePanel() {
  const [code, setCode] = useState("");
  const [state, setState] = useState<ReceiveState>("idle");
  const [result, setResult] = useState<MessageResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReceive = async () => {
    const clean = code.trim().toUpperCase();
    if (clean.length !== 4) {
      setError("Enter the full 4-character code.");
      return;
    }

    setState("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/receive?code=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Not found");
      setResult(data);
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setCode("");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Result display ─────────────────────────────────────────────────────────
  if (state === "done" && result) {
    return (
      <div className="animate-slide-up space-y-4">
        {/* Message card */}
        <div className="card-khamli rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1a56db] animate-pulse-slow" />
              <span className="text-[var(--text-muted)] text-md uppercase tracking-wider">
                {result.type === "text"
                  ? "Message"
                  : result.type === "image"
                  ? "Image"
                  : result.type === "pdf"
                  ? "PDF"
                  : "File"}
              </span>
            </div>
            <span className="text-[var(--text-faint)] text-xm">
              Expires {new Date(result.expiresAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            {result.type === "text" && result.content && (
              <div className="group relative">
                <p className="text-[var(--text-primary)] text-md leading-relaxed whitespace-pre-wrap break-words">
                  {result.content}
                </p>
                <button
                  onClick={() => copyText(result.content!)}
                  className="mt-3 flex items-center gap-1.5 text-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] btn-royal-glow rounded-xl p-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                        <rect x="4" y="4" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
                        <path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            )}

            {result.type === "image" && result.viewUrl && (
              <div className="space-y-3">
                <img
                  src={result.viewUrl}
                  alt={result.fileName || "Shared image"}
                  className="w-full max-h-72 object-contain rounded-xl border border-white/10 bg-white/[0.03]"
                />
                <div className="flex gap-2">
                  <a
                    href={result.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] border border-white/10 hover:border-white/20 hover:text-white transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    View
                  </a>
                  <a
                    href={result.downloadUrl}
                    download={result.fileName}
                    className="btn-royal flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v6M3.5 6l2.5 2.5L8.5 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1.5 10h9" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}

            {result.type === "pdf" && result.viewUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--step-bg)", border: "1px solid var(--border)" }}>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-base">
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{result.fileName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      PDF · {result.fileSize ? formatBytes(result.fileSize) : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={result.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] border border-white/10 hover:border-white/20 hover:text-white transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                    View PDF
                  </a>
                  <a
                    href={result.downloadUrl}
                    download={result.fileName}
                    className="btn-royal flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v6M3.5 6l2.5 2.5L8.5 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1.5 10h9" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}

            {result.type === "file" && result.downloadUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--step-bg)", border: "1px solid var(--border)" }}>
                  <div className="w-10 h-10 rounded-lg bg-white/[0.07] border border-white/10 flex items-center justify-center text-base">
                    {fileIcon(result.fileMime)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{result.fileName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {result.fileSize ? formatBytes(result.fileSize) : "File"}
                    </p>
                  </div>
                </div>
                <a
                  href={result.downloadUrl}
                  download={result.fileName}
                  className="btn-royal inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-white font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v8M4 8l3 3 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12h10" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Download
                </a>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full py-2 text-sm text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Enter another code
        </button>
      </div>
    );
  }

  // ── Input state ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="input-khamli rounded-2xl overflow-hidden">
        <div className="p-4 space-y-3">
          <label className="block text-md text-[var(--text-muted)] uppercase tracking-wider">
            Enter code
          </label>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleReceive()}
            placeholder="A1C3"
            maxLength={4}
            spellCheck={false}
            autoCapitalize="characters"
            disabled={state === "loading"}
            className="code-display w-full bg-transparent text-2xl tracking-[0.25em] placeholder-zinc-400/60 /15 bg-red-0 focus:outline-none disabled:opacity-50"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-geist-mono)" }}
          />
          {/* Code fill dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${
                  i < code.length ? "bg-[#1a56db]" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end px-4 py-2.5" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleReceive}
            disabled={state === "loading" || code.length !== 4}
            className="btn-royal flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white"
          >
            {state === "loading" ? (
              <>
                <svg className="animate-spin-slow" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" strokeDasharray="8 8"/>
                </svg>
                Fetching…
              </>
            ) : (
              <>
                Receive
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 2v7M3.5 7l3 3 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-400/80 text-sm flex items-center gap-2 animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 4v4M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
