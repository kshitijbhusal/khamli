// components/SendPanel.tsx
"use client";

import { useState, useRef, useCallback } from "react";

type SendState = "idle" | "uploading" | "done" | "error";

interface Attachment {
  file: File;
  type: "image" | "pdf" | "file";
  preview?: string; // object URL for images
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentType(file: File): "image" | "pdf" | "file" {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return "file";
}

export default function SendPanel() {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [state, setState] = useState<SendState>("idle");
  const [progress, setProgress] = useState(0);
  const [resultCode, setResultCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // ── File handling ──────────────────────────────────────────────────────────
  const addFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError("File too large — max 50 MB");
      return;
    }
    const type = getAttachmentType(file);
    const preview = type === "image" ? URL.createObjectURL(file) : undefined;
    setAttachment({ file, type, preview });
    setError("");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addFile(file);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) addFile(file);
  }, []);

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (state === "uploading") return;
    setError("");

    // Validation
    const hasText = text.trim().length > 0;
    const hasFile = !!attachment;
    if (!hasText && !hasFile) {
      setError("Type a message or attach a file first.");
      return;
    }

    setState("uploading");
    setProgress(10);

    try {
      if (hasFile && attachment) {
        // Step 1: get upload URL + code from server
        const metaRes = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: attachment.type,
            fileName: attachment.file.name,
            fileMime: attachment.file.type || "application/octet-stream",
            fileSize: attachment.file.size,
          }),
        });
        const meta = await metaRes.json();
        if (!metaRes.ok) throw new Error(meta.error || "Failed to initiate upload");

        setProgress(25);

        // Step 2: PUT directly to S3 using the pre-signed URL
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", meta.uploadUrl);
          xhr.setRequestHeader(
            "Content-Type",
            attachment.file.type || "application/octet-stream"
          );
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress(25 + Math.round((ev.loaded / ev.total) * 70));
            }
          };
          xhr.onload = () =>
            xhr.status === 200 ? resolve() : reject(new Error("S3 upload failed"));
          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(attachment.file);
        });

        setProgress(100);
        setResultCode(meta.code);
        setExpiresAt(new Date(meta.expiresAt));
      } else {
        // Pure text
        const res = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", content: text.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send");
        setProgress(100);
        setResultCode(data.code);
        setExpiresAt(new Date(data.expiresAt));
      }

      setState("done");
      setText("");
      removeAttachment();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
      setProgress(0);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(resultCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setState("idle");
    setResultCode("");
    setExpiresAt(null);
    setProgress(0);
    setError("");
    setTimeout(() => textRef.current?.focus(), 50);
  };

  // ── Done state ─────────────────────────────────────────────────────────────
  if (state === "done") {
    return (
      <div className="animate-slide-up">
        <div className="rounded-2xl border border-[#1a56db]/40 bg-[var(--result-bg)] p-8 text-center glow-royal">
          <div className="w-12 h-12 rounded-full bg-[#1a56db]/20 border border-[#1a56db]/30 flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11l5 5 9-9" stroke="#1a56db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Your code</p>
          <div
            className="code-display text-4xl font-bold tracking-[0.2em] mb-3 cursor-pointer select-all"
            style={{ color: "var(--text-primary)" }}
            onClick={copyCode}
            title="Click to copy"
          >
            {resultCode}
          </div>
          <p className="text-[var(--text-faint)] text-xs mb-6">
            Expires in ~10 minutes
            {expiresAt && (
              <> · {expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={copyCode}
              className="btn-royal flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3 3 7-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="5" y="5" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.2"/>
                    <path d="M2 9V2h7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copy code
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors" style={{ color: "var(--text-muted)", borderColor: "var(--border-medium)" }}
            >
              Send another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Compose state ──────────────────────────────────────────────────────────
  const isBusy = state === "uploading";

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Composer */}
      <div
        className={`input-khamli rounded-2xl overflow-hidden relative ${dragging ? "drop-zone active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {/* Attachment preview */}
        {attachment && (
          <div className="px-4 pt-4 flex items-center gap-3">
            {attachment.preview ? (
              <img
                src={attachment.preview}
                alt="preview"
                className="w-12 h-12 rounded-lg object-cover border border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M11 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path d="M11 2v5h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{attachment.file.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{formatBytes(attachment.file.size)}</p>
            </div>
            <button
              onClick={removeAttachment}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors" style={{ background: "var(--step-bg)", border: "1px solid var(--border-medium)" }}
              aria-label="Remove attachment"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Text area */}
        <textarea
          ref={textRef}
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          placeholder={
            attachment
              ? "Add a caption (optional)…"
              : "Type a message, paste a link, or attach a file…"
          }
          disabled={isBusy}
          rows={4}
          className="w-full bg-transparent text-md placeholder-zinc-500/60 resize-none px-4 py-4 focus:outline-none leading-relaxed disabled:opacity-50" style={{ color: "var(--text-primary)" }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-1">
            {/* Attach button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isBusy || !!attachment}
              title="Attach file"
              className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-white/70 hover:bg-white/[0.07] flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.5 7.5l-6 6A4 4 0 012 8l6-6a2.5 2.5 0 013.5 3.5l-6 6a1 1 0 01-1.4-1.4L10 4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="text-[var(--text-faint)] text-xs ml-1">⌘↵ to send</span>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isBusy || (!text.trim() && !attachment)}
            className="btn-royal flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
          >
            {isBusy ? (
              <>
                <svg
                  className="animate-spin-slow"
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                >
                  <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" strokeDasharray="8 8"/>
                </svg>
                {progress}%
              </>
            ) : (
              <>
                Send
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5h9M8 3l3.5 3.5L8 10" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {isBusy && (
        <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-[#1a56db] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400/80 text-sm flex items-center gap-2 animate-fade-in">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7 4v4M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept="*/*"
      />

      <p className="text-[var(--text-faint)] text-xs text-center">
        All content self-destructs in 10 minutes · No account required
      </p>
    </div>
  );
}
