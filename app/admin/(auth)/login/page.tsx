import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in · Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  return (
    <main className="login-page">
      <div className="login-card glass">
        <div className="login-brand">
          <span className="logo-mark">R</span>
          <div>
            <h1>Admin</h1>
            <p className="mono">sign in to manage your site</p>
          </div>
        </div>
        {expired && (
          <p className="form-note" role="status">
            Your session expired after 24 hours. Please sign in again.
          </p>
        )}
        <LoginForm />
      </div>
      <a href="/" className="login-back mono">
        ← back to site
      </a>
    </main>
  );
}
