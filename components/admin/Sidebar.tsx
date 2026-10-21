"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "◇" },
  { href: "/admin/content", label: "Content", icon: "▤" },
  { href: "/admin/projects", label: "Projects", icon: "▦" },
  { href: "/admin/blog", label: "Blog", icon: "✎" },
  { href: "/admin/messages", label: "Messages", icon: "✉" },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-top">
        <Link href="/admin" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark">R</span>
          <span className="logo-text">
            admin<span className="accent">.panel</span>
          </span>
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
            aria-current={isActive(item.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar-link">
          View site ↗
        </a>
        <p className="sidebar-user mono" title={email}>
          {email}
        </p>
        <form action={signOut}>
          <button type="submit" className="btn btn-ghost sidebar-signout">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
