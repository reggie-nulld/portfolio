# portfolio

A clean, futuristic personal portfolio built with **Next.js** (App Router), React and TypeScript.

## Getting started

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Customize

- **Content**: everything (name, bio, stats, projects, skills, email, socials) lives in `lib/data.ts`.
- **Colors / fonts**: CSS variables at the top of `app/globals.css`; fonts are loaded via `next/font` in `app/layout.tsx`.
- **Favicon**: `app/icon.svg`.

## Structure

```
app/          layout, page, global styles, icon
components/   one component per section (Hero, About, Projects, Skills, Contact, …)
lib/          site content (data.ts) and shared hooks
```

## Deploy

Import the repo on [Vercel](https://vercel.com/new); it's detected as a Next.js app with zero config.
