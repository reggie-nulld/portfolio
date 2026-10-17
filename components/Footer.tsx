import { profile } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer mono">
      <span>
        © {new Date().getFullYear()} {profile.name}
      </span>
      <span>Designed &amp; built with ⚡</span>
    </footer>
  );
}
