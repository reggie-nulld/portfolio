export default function Footer({ name }: { name: string }) {
  return (
    <footer className="footer mono">
      <span>
        © {new Date().getFullYear()} {name}
      </span>
      <span>Designed &amp; built with ⚡</span>
    </footer>
  );
}
