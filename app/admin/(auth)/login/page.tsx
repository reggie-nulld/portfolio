import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in · Admin" };

export default function LoginPage() {
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
        <LoginForm />
      </div>
      <a href="/" className="login-back mono">
        ← back to site
      </a>
    </main>
  );
}
