import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Tracker from "@/components/Tracker";
import { getContent } from "@/lib/content";

// Re-read the database at most once an hour; the admin also refreshes on save.
export const revalidate = 3600;

export default async function Home() {
  const { profile, stats, projects, skills, socials } = await getContent();

  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <Nav name={profile.name} domain={profile.domain} />
      <main id="top">
        <Hero profile={profile} />
        <About profile={profile} stats={stats} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Contact email={profile.email} socials={socials} />
      </main>
      <Footer name={profile.name} />
      <Tracker />
    </>
  );
}
