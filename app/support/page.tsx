// app/support/page.tsx
"use client";
import { useState } from "react";

const SOLANA_ADDRESS = "CULHUoFYC7FXcD6x1i2UvfFaCha64F1t3iuyo9ijVpr";

const tiers = [
  { label: "Coffee", amount: "$1", emoji: "☕", desc: "Keeps the server warm" },
  { label: "Lunch", amount: "$5", emoji: "🍱", desc: "Covers a month of DB hosting" },
  { label: "Patron", amount: "$20", emoji: "🚀", desc: "Funds a year of S3 storage" },
];

const costs = [
  { name: "Neon DB", desc: "Database hosting", icon: "🗄️" },
  { name: "AWS S3", desc: "File storage", icon: "📦" },
  { name: "Vercel", desc: "App hosting & CDN", icon: "⚡" },
];

export default function SupportPage() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(SOLANA_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 px-6 text-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[300px] rounded-full blur-[120px]"
            style={{ background: "rgba(26,86,219,0.06)" }} />
        </div>

        <div className="w-20 h-20 rounded-3xl bg-[#1a56db]/10 border border-[#1a56db]/20 flex items-center justify-center mx-auto mb-8 text-4xl">
          ☕
        </div>

        <div className="badge-khamli inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db]" />
          Support Khamli
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.06] mb-6"
          style={{ color: "var(--text-primary)" }}>
          Keep Khamli
          <br />
          <span style={{ color: "var(--royal)" }}>free & running.</span>
        </h1>
        <p className="max-w-lg mx-auto text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}>
          Khamli is ad-free and always will be. If it saved you from sharing your
          phone number with a stranger, a small gesture means the world.
        </p>
      </section>

      {/* ── What it costs ─────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="section-divider mb-14" />

        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            Running costs
          </p>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            What keeps this alive
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-16">
          {costs.map(({ name, desc, icon }) => (
            <div key={name} className="feature-card rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Suggested tiers */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            Any amount helps
          </p>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Pick what feels right
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-14">
          {tiers.map(({ label, amount, emoji, desc }) => (
            <div key={label} className="feature-card rounded-2xl p-6 text-center cursor-default
              hover:border-[rgba(26,86,219,0.3)] transition-colors">
              <div className="text-3xl mb-3">{emoji}</div>
              <p className="font-bold text-2xl mb-1" style={{ color: "var(--text-primary)" }}>{amount}</p>
              <p className="font-medium text-sm mb-2" style={{ color: "var(--royal)" }}>{label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Solana donation card */}
        <div className="support-card rounded-3xl p-8 glow-royal-sm">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(153,69,255,0.12)", border: "1px solid rgba(153,69,255,0.22)" }}>
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M3 14h17.5l-2.5 3H.5L3 14z" fill="#9945FF" opacity="0.9"/>
                <path d="M3 7h17.5l-2.5 3H.5L3 7z" fill="#9945FF" opacity="0.7"/>
                <path d="M3 0h17.5L18 3H.5L3 0z" fill="#9945FF"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                Solana · USDT
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Send any amount — all contributions go directly to server costs
              </p>
            </div>
          </div>

          {/* Address box */}
          <div className="rounded-2xl p-5 mb-5"
            style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-medium)" }}>
            <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              Wallet address
            </p>
            <p className="font-mono text-sm break-all leading-relaxed select-all"
              style={{ color: "var(--text-secondary)" }}>
              {SOLANA_ADDRESS}
            </p>
          </div>

          <button onClick={copy}
            className="btn-royal w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-base font-semibold text-white">
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l4 4 8-8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied to clipboard!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="6" y="6" width="8" height="8" rx="2" stroke="white" strokeWidth="1.3"/>
                  <path d="M2 10V2h8" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copy wallet address
              </>
            )}
          </button>

          <p className="text-xs text-center mt-4" style={{ color: "var(--text-faint)" }}>
            Use the <strong>Solana network</strong> when sending USDT
          </p>
        </div>

        {/* Other ways */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Other ways to support Khamli</p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path fillRule="evenodd" clipRule="evenodd"
                  d="M7 0C3.13 0 0 3.13 0 7c0 3.09 2 5.71 4.78 6.63.35.06.48-.15.48-.34v-1.18c-1.95.42-2.36-.95-2.36-.95-.32-.81-.77-1.03-.77-1.03-.63-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.08 1.63.77 2.03.59.06-.46.24-.77.44-.95-1.55-.18-3.18-.77-3.18-3.44 0-.76.27-1.38.72-1.87-.07-.18-.31-.88.07-1.84 0 0 .58-.19 1.9.71A6.6 6.6 0 017 3.35c.59 0 1.18.08 1.73.23 1.32-.9 1.9-.71 1.9-.71.38.96.14 1.66.07 1.84.45.49.72 1.11.72 1.87 0 2.68-1.64 3.26-3.2 3.43.25.22.48.65.48 1.31v1.95c0 .19.13.41.48.34C12 12.71 14 10.09 14 7c0-3.87-3.13-7-7-7z"
                  fill="currentColor"/>
              </svg>
              Star on GitHub
            </a>
            <span style={{ color: "var(--border-medium)" }}>·</span>
            <span style={{ color: "var(--text-muted)" }}>Tell a friend</span>
            <span style={{ color: "var(--border-medium)" }}>·</span>
            <a href="/about"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"}
            >
              Read our story
            </a>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs"
          style={{ color: "var(--text-faint)" }}>
          <span>© 2024 Khamli · Built for privacy</span>
          <a href="/" style={{ color: "var(--text-muted)" }} className="hover:underline">Home</a>
        </div>
      </footer>

    </div>
  );
}
