# portfolio

A minimal, single-page personal portfolio built with **Next.js** (App Router), React and TypeScript.

## Getting started

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Customize

- **Content**: everything (name, bio, projects, stack, email, links) lives in `lib/data.ts`.
- **Colors / fonts**: CSS variables at the top of `app/globals.css`; fonts are loaded via `next/font` in `app/layout.tsx`.
- **Favicon**: `app/icon.svg`.

## Structure

```
app/          layout, page, global styles, icon
lib/          site content (data.ts)
```

## Deploy

Import the repo on [Vercel](https://vercel.com/new); it's detected as a Next.js app with zero config.
