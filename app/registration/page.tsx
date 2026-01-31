"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirm) {
      setError("Please complete all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: replace with real registration request
      router.push("/login");
    } catch {
      setError("Account creation failed. Please try again.");
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

      <section className={styles.container} aria-label="Registration form">
        <div className={styles.card}>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>
            Create a secure account to access online services.
          </p>

          {error && (
            <div className={styles.alert} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className={styles.input}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First and last name"
                autoComplete="name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
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
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                className={styles.input}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isLoading}>
              {isLoading ? "Creating…" : "Create account"}
            </button>

            <div className={styles.linksRow}>
              <Link className={styles.link} href="/login">
                Back to sign in
              </Link>
              <Link className={styles.link} href="/help">
                Need help
              </Link>
            </div>

            <p className={styles.helpText}>
              Make sure your email is correct. You may need it to recover access.
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
