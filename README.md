# portfolio

A clean, futuristic personal portfolio built with **Next.js** (App Router), React and TypeScript.

## Getting started

```sh
npm install
npm run dev      # http://localhost:3737
npm run build    # production build
npm start        # serve the production build
```

## Database setup (Supabase)

Content is stored in a Supabase Postgres database. Without one, the site falls
back to the defaults in `lib/data.ts`.

1. Copy `.env.example` to `.env.local` and fill in the values from your Supabase project.
2. Create the tables and copy in the starting content:

   ```sh
   npm run db:setup
   ```

   This runs `db:migrate` (creates the tables) then `db:seed` (copies `lib/data.ts`
   into them). Seeding skips if content already exists; `npm run db:seed -- --force`
   resets the content tables.
3. `npm run db:studio` opens a browser view of the database.

After changing `lib/db/schema.ts`, run `npm run db:generate` to create a new migration
in `drizzle/`, then `npm run db:migrate`.

## Admin (`/admin`)

1. In Supabase → **Authentication → Users → Add user → Create new user**, enter your
   email and a strong password, and tick **Auto Confirm User**.
2. In Supabase → **Authentication → Sign In / Providers**, turn **off** "Allow new users
   to sign up" so nobody else can create an account.
3. Put the same email in `ADMIN_EMAILS` in `.env.local` (comma-separate several).
4. Restart `npm run dev` and sign in at http://localhost:3737/admin.

Only emails listed in `ADMIN_EMAILS` get in, even if someone else has a Supabase account.

In the admin:

- **Content**: profile and hero text, photo, typing phrases, About, stats, skills and social links.
- **Projects**: add, edit, delete, publish/unpublish, feature and reorder (drag or arrows), with screenshots.

- **Dashboard**: visitors, page views and project clicks for the last 7, 30 or 90 days, with a
  daily traffic chart and top sources, countries, devices and browsers.

- **Messages**: everything sent through the contact form, with unread counts, reply-by-email,
  mark as read/unread and delete.

**Email alerts (optional):** create a free account at [resend.com](https://resend.com), make an
API key, and add it as `RESEND_API_KEY` (in `.env.local` and in Vercel). You'll get an email for
every new message, and replying to it answers the sender. Until you verify your own domain in
Resend, alerts can only go to the email address you signed up to Resend with.

The contact form ignores obvious bots (a hidden trap field and a minimum fill time) and accepts
at most 3 messages per sender, and 30 in total, per hour.

Visits are counted by `app/api/track` without cookies and without storing IP addresses (a
daily-rotating hash tells visitors apart). Bots and your own visits while signed in are skipped.
Add `?ref=linkedin` (or `?utm_source=…`) to links you share to see them as a source.

Saving updates the live site straight away; no redeploy needed. Image uploads need
`SUPABASE_SECRET_KEY`; the first upload creates a public `media` bucket in Supabase Storage.

## Customize

- **Content**: edit it in `/admin`; `lib/data.ts` holds the defaults used before the database is set up.
- **Photo**: upload it in `/admin/content`, or put it in `public/` and enter its path (e.g. `/me.jpg`).
- **Colors / fonts**: the green accent palette is a few CSS variables at the top of `app/globals.css`; fonts are loaded via `next/font` in `app/layout.tsx`.
- **Favicon**: `app/icon.svg`.

## Structure

```
app/          layout, page, global styles, icon
components/   one component per section (Hero, About, Projects, Skills, Contact, …)
lib/          content loader, database schema (db/), defaults (data.ts), hooks
scripts/      seed script
drizzle/      database migrations
```

## Deploy

Import the repo on [Vercel](https://vercel.com/new); it's detected as a Next.js app.
Add every variable from `.env.example` under **Settings → Environment Variables**.
`vercel.json` pins server functions to Dublin (`dub1`), next to the Supabase database.
