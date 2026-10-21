import {
  bigserial,
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Every table has Row Level Security enabled and no policies, so Supabase's
// public API can't read or write any of it. The site's server code connects
// as the table owner, which RLS doesn't restrict.

/** Single-row table (id = 1) holding the profile and hero content. */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  avatar: text("avatar").notNull(),
  tagline: text("tagline").notNull(),
  typedWords: text("typed_words").array().notNull(),
  available: boolean("available").notNull().default(true),
  email: text("email").notNull(),
  about: text("about").array().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  suffix: text("suffix").notNull().default(""),
  label: text("label").notNull(),
  position: integer("position").notNull().default(0),
}).enableRLS();

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default([]),
  href: text("href").notNull().default("#"),
  githubUrl: text("github_url"),
  imageUrl: text("image_url"),
  year: text("year"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const skillGroups = pgTable("skill_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  items: text("items").array().notNull().default([]),
  position: integer("position").notNull().default(0),
}).enableRLS();

export const socials = pgTable("socials", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  position: integer("position").notNull().default(0),
}).enableRLS();

/** Contact form submissions (Phase 5). */
export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    body: text("body").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_created_at_idx").on(t.createdAt)]
).enableRLS();

/** One row per page view (Phase 4). visitorHash is an anonymous daily hash, never a raw IP. */
export const pageViews = pgTable(
  "page_views",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    country: text("country"),
    device: text("device"),
    browser: text("browser"),
    visitorHash: text("visitor_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("page_views_created_at_idx").on(t.createdAt)]
).enableRLS();

/** Interaction events such as project clicks (Phase 4). */
export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    type: text("type").notNull(),
    target: text("target"),
    path: text("path"),
    visitorHash: text("visitor_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_created_at_idx").on(t.createdAt)]
).enableRLS();
