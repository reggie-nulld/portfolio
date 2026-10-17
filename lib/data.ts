// All site content lives here. Edit this file to make the portfolio yours.

export const profile = {
  name: "Reggie",
  domain: "reggie.dev",
  tagline:
    "Developer focused on crafting minimal, high-performance products where thoughtful design meets solid engineering.",
  typedWords: ["digital experiences.", "fast web apps.", "clean interfaces.", "the future."],
  available: true,
  email: "hello@example.com",
  about: [
    "I'm a developer who loves turning complex problems into simple, elegant interfaces. I care about the details — performance, accessibility, and the small interactions that make software feel alive.",
    "Right now I'm exploring modern web tooling, creative coding, and building products that feel like they're from a few years ahead.",
  ],
};

export const stats = [
  { value: 3, suffix: "+", label: "Years coding" },
  { value: 20, suffix: "+", label: "Projects shipped" },
  { value: 10, suffix: "+", label: "Technologies" },
  { value: 100, suffix: "%", label: "Curiosity" },
];

export type Project = {
  title: string;
  description: string;
  tags: string[];
  href: string;
};

export const projects: Project[] = [
  {
    title: "Project Nebula",
    description:
      "A real-time analytics dashboard with live data streams, interactive charts, and a fully responsive layout.",
    tags: ["React", "TypeScript", "WebSockets"],
    href: "#",
  },
  {
    title: "Synthwave UI",
    description:
      "An open-source component library focused on accessibility, motion design, and dark-mode-first aesthetics.",
    tags: ["CSS", "Design Systems", "a11y"],
    href: "#",
  },
  {
    title: "Orbit API",
    description:
      "A scalable REST + GraphQL backend with auth, rate limiting, and automated deployments to the cloud.",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    href: "#",
  },
  {
    title: "Pulse AI",
    description:
      "An AI-powered assistant that summarizes documents and answers questions with a clean chat interface.",
    tags: ["Python", "LLMs", "FastAPI"],
    href: "#",
  },
];

export const skills = [
  { group: "frontend", items: ["HTML & CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind"] },
  { group: "backend", items: ["Node.js", "Python", "REST / GraphQL", "PostgreSQL", "MongoDB"] },
  { group: "tools", items: ["Git & GitHub", "Docker", "Figma", "Linux", "CI / CD"] },
];

export const socials = [
  { label: "GitHub", href: "https://github.com/reggie-nulld" },
  { label: "LinkedIn", href: "#" },
  { label: "X / Twitter", href: "#" },
];

export const navLinks = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
