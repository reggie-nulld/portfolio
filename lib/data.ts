// All site content lives here. Edit this file to make the portfolio yours.

export const profile = {
  name: "Reggie",
  role: "Developer",
  location: "Earth",
  bio: [
    "I build clean, fast software for the web. I care about the details: performance, accessibility, and interfaces that get out of the way.",
    "Right now I'm exploring modern web tooling and shipping small products.",
  ],
  email: "hello@example.com",
};

export type Project = {
  title: string;
  description: string;
  href: string;
  year: string;
};

export const projects: Project[] = [
  {
    title: "Project Nebula",
    description: "Real-time analytics dashboard with live data streams.",
    href: "#",
    year: "2026",
  },
  {
    title: "Synthwave UI",
    description: "Open-source component library focused on accessibility.",
    href: "#",
    year: "2025",
  },
  {
    title: "Orbit API",
    description: "REST + GraphQL backend with auth and rate limiting.",
    href: "#",
    year: "2025",
  },
  {
    title: "Pulse AI",
    description: "Assistant that summarizes documents and answers questions.",
    href: "#",
    year: "2024",
  },
];

export const stack = ["TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "Docker"];

export const links = [
  { label: "GitHub", href: "https://github.com/reggie-nulld" },
  { label: "LinkedIn", href: "#" },
  { label: "X", href: "#" },
];
