import type { Metadata } from "next";
import PageHeader from "@/components/admin/PageHeader";
import ProfileForm from "@/components/admin/ProfileForm";
import RowsForm from "@/components/admin/RowsForm";
import { requireAdmin } from "@/lib/auth";
import { getAllContent } from "@/lib/content";
import { isStorageConfigured } from "@/lib/storage";
import { saveSkills, saveSocials, saveStats } from "./actions";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  await requireAdmin();
  const { content, fromDatabase, hasDatabase } = await getAllContent();

  return (
    <>
      <PageHeader title="Content" subtitle="Your profile, hero, about, stats, skills and social links." />

      {!hasDatabase ? (
        <p className="form-error">No database connection: DATABASE_URL isn&apos;t set, so changes can&apos;t be saved.</p>
      ) : (
        !fromDatabase && (
          <p className="form-note">
            Showing the built-in starter content. Saving the profile below stores it in your database.
          </p>
        )
      )}

      <div className="sections">
        <section className="panel glass" id="profile">
          <h2 className="panel-title">Profile &amp; hero</h2>
          <ProfileForm profile={content.profile} uploadsEnabled={isStorageConfigured} />
        </section>

        <section className="panel glass" id="stats">
          <h2 className="panel-title">Stats</h2>
          <p className="panel-sub">The counters next to your About text.</p>
          <RowsForm
            action={saveStats}
            columns={[
              { name: "value", label: "Number", type: "number", width: "100px", placeholder: "20" },
              { name: "suffix", label: "Suffix", width: "80px", placeholder: "+" },
              { name: "label", label: "Label", placeholder: "Projects shipped" },
            ]}
            initialRows={content.stats.map((s) => ({ value: String(s.value), suffix: s.suffix, label: s.label }))}
            max={8}
            addLabel="Add stat"
            emptyText="No stats. The About section will show just your text."
          />
        </section>

        <section className="panel glass" id="skills">
          <h2 className="panel-title">Skills</h2>
          <p className="panel-sub">Separate skills with commas.</p>
          <RowsForm
            action={saveSkills}
            columns={[
              { name: "name", label: "Group", width: "minmax(110px, 1fr)", placeholder: "frontend" },
              { name: "items", label: "Skills", width: "3fr", placeholder: "React, Next.js, TypeScript" },
            ]}
            initialRows={content.skills.map((s) => ({ name: s.group, items: s.items.join(", ") }))}
            max={8}
            addLabel="Add group"
            emptyText="No skill groups yet."
          />
        </section>

        <section className="panel glass" id="socials">
          <h2 className="panel-title">Social links</h2>
          <p className="panel-sub">Shown under the &ldquo;Say hello&rdquo; button.</p>
          <RowsForm
            action={saveSocials}
            columns={[
              { name: "label", label: "Label", width: "minmax(110px, 1fr)", placeholder: "GitHub" },
              { name: "href", label: "Link", type: "url", width: "3fr", placeholder: "https://github.com/you" },
            ]}
            initialRows={content.socials.map((s) => ({ label: s.label, href: s.href }))}
            max={10}
            addLabel="Add link"
            emptyText="No links yet."
          />
        </section>
      </div>
    </>
  );
}
