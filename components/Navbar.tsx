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
          <div className="w-8 h-8 rounded-xl bg-[#1a56db] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
              className="group-hover:scale-110 transition-transform duration-200">
              <path d="M2.5 7.5C2.5 4.46 4.96 2 8 2s5.5 2.46 5.5 5.5-2.46 5.5-5.5 5.5"
                stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 13C8 13 5 11.2 5 7.5"
                stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold tracking-tight text-[15px]" style={{ color: "var(--text-primary)" }}>
            KHAMLI
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
