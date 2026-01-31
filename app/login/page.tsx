"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Enter your email (or phone) and password.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: replace with real auth call
      router.push("/dashboard");
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header} role="banner">
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true" />
          <div className={styles.brandText}>
            <div className={styles.govName}>Government Services</div>
            <div className={styles.appName}>Secure Access Portal</div>
          </div>
        </div>
      </header>

      <section className={styles.container} aria-label="Login form">
        <div className={styles.card}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>
            Use your registered email (or phone) and password.
          </p>

          {error && (
            <div className={styles.alert} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="identifier">
                Email or phone number
              </label>
              <input
                id="identifier"
                className={styles.input}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                placeholder="name@example.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </button>

            <div className={styles.linksRow}>
              <Link className={styles.link} href="/forgot-password">
                Forgot password
              </Link>
              <Link className={styles.link} href="/register">
                Create an account
              </Link>
            </div>

            <p className={styles.helpText}>
              This is a secure service. Do not share your password.
            </p>
          </form>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© Government Services</span>
          <span className={styles.dot} aria-hidden="true">•</span>
          <Link className={styles.footerLink} href="/privacy">
            Privacy
          </Link>
          <span className={styles.dot} aria-hidden="true">•</span>
          <Link className={styles.footerLink} href="/terms">
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}
