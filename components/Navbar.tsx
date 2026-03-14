// components/Navbar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav-khamli sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Khamli home">
          <div className="w-10 h-8 rounded-xl  flex items-center justify-center">
            <svg width="76" height="76" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">

              {/* <!-- White square background --> */}
              <rect x="0" y="0" width="64" height="64" rx="12" fill="white" />

              {/* <!-- Envelope border --> */}
              <rect x="12" y="20" width="40" height="24" rx="3"
                stroke="black" stroke-width="2" fill="none" />

              {/* <!-- Envelope flap --> */}
              <path d="M12 22 L32 36 L52 22"
                stroke="black"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round" />

              {/* <!-- Minimal airmail corner marks --> */}
              <path d="M16 18 L20 22" stroke="black" stroke-width="2" />
              <path d="M48 18 L44 22" stroke="black" stroke-width="2" />
              <path d="M16 46 L20 42" stroke="black" stroke-width="2" />
              <path d="M48 46 L44 42" stroke="black" stroke-width="2" />

            </svg>
          </div>


          <span className="font-bold tracking-tight text-[15px]" style={{ color: "var(--text-primary)" }}>
            Ʞhamli
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className="px-3.5 py-2 rounded-xl text-md font-medium transition-colors"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  background: active ? "var(--step-bg)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
          <div className="ml-2 pl-2" style={{ borderLeft: "1px solid var(--border-medium)" }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
