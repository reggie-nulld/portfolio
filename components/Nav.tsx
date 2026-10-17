"use client";

import { useState } from "react";
import { navLinks, profile } from "@/lib/data";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [name, tld] = profile.domain.split(".");

  return (
    <header className="nav">
      <a href="#top" className="logo" aria-label="Home">
        <span className="logo-mark">{profile.name[0]}</span>
        <span className="logo-text">
          {name}
          <span className="accent">.{tld}</span>
        </span>
      </a>
      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
      <nav className={`nav-links ${open ? "open" : ""}`}>
        {navLinks.map((link, i) => (
          <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>
            <span className="mono">{String(i + 1).padStart(2, "0")}.</span> {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
