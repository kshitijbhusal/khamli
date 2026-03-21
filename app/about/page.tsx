// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Khamli",
  description: "Why Khamli exists and what problem it solves.",
};

const dataPoints = [
  {
    label: "Text messages",
    desc: "Stored in a Neon PostgreSQL database. Hard-deleted 10 minutes after creation — not archived, not soft-deleted.",
  },
  {
    label: "Files (images, PDFs, any format)",
    desc: "Uploaded directly to AWS S3 via a short-lived pre-signed URL — the server never touches the bytes. A cleanup job runs every 5 minutes and deletes the S3 object and database record once expired.",
  },
  {
    label: "No analytics or tracking",
    desc: "Khamli uses no cookies, fingerprinting, or third-party analytics. We genuinely do not know who you are.",
  },
  {
    label: "Codes are ephemeral",
    desc: "The 6-character code only maps to content for 10 minutes. After expiry the mapping is gone. Entering an old code returns nothing.",
  },
];

const shareTypes = [
  { icon: "🔗", label: "Links & URLs" },
  { icon: "🖼️", label: "Images" },
  { icon: "📄", label: "PDFs" },
  { icon: "🗜️", label: "ZIP files" },
  { icon: "💬", label: "Text messages" },
  { icon: "🎬", label: "Videos" },
  { icon: "🔑", label: "Sensitive snippets" },
  { icon: "📦", label: "Any file up to 50 MB" },
];

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-end justify-center">
          <div className="w-[600px] h-[300px] rounded-full blur-[120px]"
            style={{ background: "rgba(26,86,219,0.06)" }} />
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="badge-khamli inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db]" />
            About Khamli
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.06] mb-6"
            style={{ color: "var(--text-primary)" }}>
            Sharing without
            <br />
            <span style={{ color: "var(--royal)" }}>exposing yourself.</span>
          </h1>
          <p className="text-xl leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
            Khamli is a zero-friction, zero-identity file and message sharing tool.
            No account. No email. No trace.
          </p>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="section-divider mb-16" />

        <div className="space-y-16">

          <div>
            <h2 className="text-2xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>
              The problem
            </h2>
            <div className="space-y-4 text-base leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
              <p>
                You need to share something with a stranger — a link, a file, a quick message.
                But every tool asks you to reveal something personal first: your phone number,
                your email address, your WhatsApp, your identity.
              </p>
              <p>
                That connection between you and the stranger persists. It ends up in a contact
                list, a chat history, a server log somewhere. Forever.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>
              The solution
            </h2>
            <div className="space-y-4 text-base leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
              <p>
                Khamli strips the problem to its essence: two people need to exchange
                a piece of information, once, without any permanent record.
              </p>
              <p>
                You paste or attach what you want to share. You get a 6-character code.
                You read that code to the other person — out loud, by SMS, any channel — and
                they retrieve it. Ten minutes later, both the content and the code are gone.
                The transaction never happened.
              </p>
            </div>
          </div>

          {/* What you can share */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              What you can share
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shareTypes.map(({ icon, label }) => (
                <div key={label}
                  className="feature-card rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data handling */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              How your data is handled
            </h2>
            <div className="space-y-4">
              {dataPoints.map(({ label, desc}) => (
                <div key={label} className="feature-card rounded-2xl p-6">
                  <p className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Name origin */}
          <div>
            <h2 className="text-2xl font-bold mb-5" style={{ color: "var(--text-primary)" }}>
              The name
            </h2>
            <p className="text-base leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Khamli</strong> (खामली) is a Nepali word
              loosely meaning &ldquo;to pass something along quietly&rdquo; — which is exactly
              what this tool does. Simple. Intentional. Leaves no footprint.
            </p>
          </div>

        </div>

        <div className="section-divider mt-16 mb-12" />

        {/* CTA */}
        <div className="text-center">
          <p className="mb-6 text-base" style={{ color: "var(--text-muted)" }}>
            Ready to try it?
          </p>
          <a href="/"
            className="btn-royal inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white">
            Open Khamli
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs"
          style={{ color: "var(--text-faint)" }}>
          <span>© 2024 Khamli · Built for privacy</span>
          <a href="/support" className="hover:underline" style={{ color: "var(--text-muted)" }}>Support us</a>
        </div>
      </footer>

    </div>
  );
}
