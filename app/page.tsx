// app/page.tsx
import SendPanel from "@/components/SendPanel";
import ReceivePanel from "@/components/ReceivePanel";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="#1a56db" strokeWidth="1.4" />
        <path d="M10 6v4l3 3" stroke="#1a56db" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "10-minute wipe",
    desc: "Content and code cease to exist automatically. No manual deletion needed.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="#1a56db" strokeWidth="1.4" />
        <path d="M7 10h6M10 7v6" stroke="#1a56db" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "Any file type",
    desc: "Images, PDFs, ZIPs, videos — up to 50 MB. Stored directly on AWS S3.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10a6 6 0 1012 0A6 6 0 004 10z" stroke="#1a56db" strokeWidth="1.4" />
        <path d="M4 10H2M18 10h-2M10 4V2M10 18v-2" stroke="#1a56db" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "Zero identity",
    desc: "No account, no email, no phone number. You are just a code.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10l4 4 6-7" stroke="#1a56db" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Open & auditable",
    desc: "The codebase is public. Verify the wipe mechanism yourself.",
  },
];

const steps = [
  { n: "01", title: "Compose", desc: "Type a message, paste a URL, or drag in any file up to 50 MB." },
  { n: "02", title: "Get a code", desc: "A unique 6-character alphanumeric code is instantly generated." },
  { n: "03", title: "Share the code", desc: "Read it aloud, text it — no app or account needed on either end." },
  { n: "04", title: "Auto-wipe", desc: "After 10 minutes, the content and the code are permanently deleted." },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-8 px-6 text-center overflow-hidden">
        {/* Ambient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[400px] rounded-full blur-[140px]"
            style={{ background: "rgba(26,86,219,0.07)" }} />
        </div>

        {/* Badge */}
        <div className="badge-khamli inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db]/50 animate-pulse" />
          <p className="text-md  uppercase font-extrabold " >No login · No signup · Self-destructs in 10 min</p>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold tracking-tight leading-[1.06] mb-6"
          style={{ color: "var(--text-primary)" }}>
          Share anything,
          <br />
          <span style={{ color: "var(--royal)" }}>no strings attached.</span>
        </h1>

        {/* <p className="max-w-xl mx-auto text-lg leading-relaxed mb-10"
          style={{ color: "var(--text-secondary)" }}>
          Drop a message, link, image, PDF, or file. Get a 6-character code.
          Share the code. Everything vanishes in 10 minutes — no trace, no account.
        </p> */}

      </section>

      {/* ── Send + Receive panels ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Send */}
          <div className="card-khamli rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="icon-wrap w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17 3L3 8.5l6 2 2 6L17 3z" stroke="#1a56db" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M10.5 9.5l3.5-3.5" stroke="#1a56db" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-xl" style={{ color: "var(--text-primary)" }}>Send</h2>
                <p className="text-md" style={{ color: "var(--text-muted)" }}>
                  Compose and get a shareable code
                </p>
              </div>
            </div>
            <SendPanel />
          </div>

          {/* Receive */}
          <div className="card-khamli rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="icon-wrap w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v10M6.5 10l3.5 3.5 3.5-3.5" stroke="#1a56db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 17h14" stroke="#1a56db" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-xl" style={{ color: "var(--text-primary)" }}>Receive</h2>
                <p className="text-md" style={{ color: "var(--text-muted)" }}>
                  Enter a code to retrieve content
                </p>
              </div>
            </div>
            <ReceivePanel />
          </div>

        </div>
      </section>

      <section className="relative pt-0 pb-16 px-6 text-center overflow-hidden">


        <p className="max-w-xl mx-auto text-lg leading-relaxed mb-4"
          style={{ color: "var(--text-secondary)" }}>
          Drop a message, link, image, PDF, or file. Get a 6-character code.
          Share the code. Everything vanishes in 10 minutes — no trace, no account.
        </p>


      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="section-divider mb-16" />
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            Why Khamli
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Built for privacy-first sharing
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="icon-wrap w-10 h-10 rounded-xl flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="section-divider mb-16" />
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-faint)" }}>
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Four steps, ten minutes, gone.
          </h2>
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ n, title, desc }, i) => (
            <div key={n} className="step-card rounded-2xl p-7 flex flex-col gap-3 relative">
              {/* Connector line (hidden on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(100%+10px)] w-[calc(100%-20px)] h-px z-10"
                  style={{ background: "var(--border-medium)", width: "20px" }} />
              )}
              <span className="font-mono text-sm font-medium" style={{ color: "var(--royal)" }}>
                {n}
              </span>
              <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs"
          style={{ color: "var(--text-faint)" }}>
          <span>© 2024 Khamli · Built for privacy</span>
          <div className="flex items-center gap-5">
            <a href="/about" className="hover:underline" style={{ color: "var(--text-muted)" }}>About</a>
            <a href="/support" className="hover:underline" style={{ color: "var(--text-muted)" }}>Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
