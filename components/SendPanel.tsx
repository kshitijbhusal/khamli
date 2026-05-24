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

const MAX_ATTACHMENTS = 10;

export default function SendPanel() {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [state, setState] = useState<SendState>("idle");
  const [progress, setProgress] = useState(0);
  const [resultCode, setResultCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);


  const [expireHour, setExpireHour] = useState<number | null>(0.5); // default to 30 minutes
  

  // ── File handling ──────────────────────────────────────────────────────────
  const addFiles = (files: File[]) => {
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setError(`Max ${MAX_ATTACHMENTS} files allowed.`);
      return;
    }

    const toAdd = files.slice(0, remaining);
    const oversized = toAdd.find((f) => f.size > 500 * 1024 * 1024);
    if (oversized) {
      setError(`"${oversized.name}" exceeds the 500 MB limit.`);
      return;
    }

    const newAttachments: Attachment[] = toAdd.map((file) => {
      const type = getAttachmentType(file);
      return { file, type, preview: type === "image" ? URL.createObjectURL(file) : undefined };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    setError("");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files));
    },
    [attachments]
  );

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const copy = [...prev];
      if (copy[index]?.preview) URL.revokeObjectURL(copy[index].preview!);
      copy.splice(index, 1);
      return copy;
    });
  };

  // ── Upload one file to a pre-signed URL, tracking progress ────────────────
  const uploadToS3 = (
    file: File,
    uploadUrl: string,
    onProgress: (pct: number) => void
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error("S3 upload failed")));
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(file);
    });

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (state === "uploading") return;
    setError("");

    const hasText = text.trim().length > 0;
    const hasFiles = attachments.length > 0;
    if (!hasText && !hasFiles) {
      setError("Type a message or attach a file first.");
      return;
    }

    setState("uploading");
    setProgress(5);

    try {
      if (hasFiles) {
        // ── Step 1: single API call — get ONE code + one presigned URL per file ──
        const metaRes = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "files",
            expireAtHour: expireHour,
            caption: hasText ? text.trim() : undefined,
            files: attachments.map((att) => ({
              fileName: att.file.name,
              fileMime: att.file.type || "application/octet-stream",
              fileSize: att.file.size,
            })),
          }),
        });

        const meta = await metaRes.json();
        if (!metaRes.ok) throw new Error(meta.error || "Failed to initiate upload");

        // meta = { code, expiresAt, files: [{ fileName, fileMime, fileKey, uploadUrl }] }
        const { code, expiresAt: exp, files: fileSlots } = meta as {
          code: string;
          expiresAt: string;
          files: { fileName: string; fileMime: string; fileKey: string; uploadUrl: string }[];
        };

        // ── Step 2: upload all files in parallel, aggregating progress ────────
        const perFileProgress = new Array(attachments.length).fill(0);

        await Promise.all(
          attachments.map((att, i) =>
            uploadToS3(att.file, fileSlots[i].uploadUrl, (pct) => {
              perFileProgress[i] = pct;
              const overall =
                10 + // reserve first 10% for API call
                Math.round(
                  (perFileProgress.reduce((a, b) => a + b, 0) / attachments.length) * 0.9
                );
              setProgress(overall);
            })
          )
        );

        setProgress(100);
        setResultCode(code);
        setExpiresAt(new Date(exp));
      } else {
        // ── Pure text ──────────────────────────────────────────────────────────
        const res = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "text", content: text.trim(), expireAtHour: expireHour }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send");
        setProgress(100);
        setResultCode(data.code);
        setExpiresAt(new Date(data.expiresAt));
      }

      setState("done");
      setText("");
      setAttachments([]);
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
            className="code-display text-4xl font-bold tracking-[0.2em] mb-2 cursor-pointer select-all"
            style={{ color: "var(--text-primary)" }}
            onClick={copyCode}
            title="Click to copy"
          >
            {resultCode}
          </div>

          <p className="text-[var(--text-faint)] text-xs mb-6">
            {attachments.length > 1
              ? `All ${attachments.length} files accessible with this code · `
              : ""}
            This code will expire at
            {expiresAt && (
              <> {expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
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
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={{ color: "var(--text-muted)", borderColor: "var(--border-medium)" }}
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
  const canAddMore = attachments.length < MAX_ATTACHMENTS;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Composer */}
      <div
        className={`input-khamli rounded-2xl overflow-hidden relative ${dragging ? "drop-zone active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="px-4 pt-4 flex flex-wrap gap-2">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl pr-2"
                style={{ background: "var(--step-bg)", border: "1px solid var(--border)" }}
              >
                {att.preview ? (
                  <img src={att.preview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--step-bg)" }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M11 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z"
                        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
                        style={{ color: "var(--text-muted)" }}
                      />
                      <path d="M11 2v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}/>
                    </svg>
                  </div>
                )}
                <div className="min-w-0 max-w-[100px]">
                  <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{att.file.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatBytes(att.file.size)}</p>
                </div>
                <button
                  onClick={() => removeAttachment(i)}
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: "var(--border-medium)" }}
                  aria-label="Remove attachment"
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}

            {/* Add more slot */}
            {canAddMore && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isBusy}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
                style={{ border: "1px dashed var(--border-medium)", color: "var(--text-faint)" }}
                title={`Add another file (${attachments.length}/${MAX_ATTACHMENTS})`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
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
              attachments.length > 0
                ? "Add a caption (optional)…"
                : "Type a message, paste a link, or attach a file…"
            }
            disabled={isBusy}
            rows={4}
            className="w-full bg-transparent text-md placeholder-slate-300/60 resize-none px-4 py-4 focus:outline-none leading-relaxed disabled:opacity-50"
            style={{ color: "var(--text-primary)" }}
          />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-1">
            {/* Attach button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isBusy || !canAddMore}
              title={canAddMore ? `Attach file (${attachments.length}/${MAX_ATTACHMENTS})` : "Max files reached"}
              className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-white/70 hover:bg-white/[0.07] flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.5 7.5l-6 6A4 4 0 012 8l6-6a2.5 2.5 0 013.5 3.5l-6 6a1 1 0 01-1.4-1.4L10 4"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* File count badge */}
            {attachments.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: "var(--step-bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                {attachments.length}/{MAX_ATTACHMENTS}
              </span>
            )}

            <span className="text-[var(--text-faint)] text-xs ml-1">⌘↵ to send</span>
          </div>

          {/* Send button */}
             {/* add a dropdown to select expiry time before sending, default to 10 minutes, options: 30 min, 2 hour, 12 hours, 24 hours */}
            <select
              value={expireHour ?? ""}
              onChange={(e) => setExpireHour(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isBusy}
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              className="mr-3 px-2 py-1 rounded-md bg-[var(--card-bg)] text-sm border border-[var(--border)] text-[var(--text-muted)] focus:outline-none"
            >
             
              <option value={1} >Expires in 30 min (default) </option>
              <option value={2}>Expires in 2 hours</option>
              <option value={12}>Expires in 12 hours</option>
              <option value={24}>Expires in 24 hours</option>
            </select>

          <button
            onClick={handleSend}
            disabled={isBusy || (!text.trim() && attachments.length === 0)}
            className="btn-royal flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
          >
            {isBusy ? (
              <>
                <svg className="animate-spin-slow" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" strokeDasharray="8 8"/>
                </svg>
                {progress}%
              </>
            ) : (
              <>
                {attachments.length > 1 ? `Send ${attachments.length} files` : "Send"}
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

      {/* Hidden file input — multiple enabled */}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={onFileChange}
        accept="*/*"
      />

      <p className="text-[var(--text-faint)] text-xs text-center">
        Up to {MAX_ATTACHMENTS} files · 500 MB each · Self-destructs After Expiry
      </p>
    </div>
  );
}
