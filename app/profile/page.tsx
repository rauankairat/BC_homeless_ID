"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";

type Profile = {
  internalId: string;        // safer than "government id"
  displayName: string;
  status: "active" | "inactive";
  program?: string;          // example non-sensitive field
  lastUpdated: string;       // ISO string
};

export default function ProfileLookupPage() {
  const [queryId, setQueryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Profile | null>(null);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = queryId.trim();
    if (!trimmed) {
      setError("Enter an ID to search.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`/api/profile?lookup=${encodeURIComponent(trimmed)}`, {
        method: "GET",
      });

      if (res.status === 404) {
        setError("No profile found for that ID.");
        return;
      }
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Request failed.");
      }

      const data = (await res.json()) as { profile: Profile };
      setResult(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
            <div className={styles.appName}>Profile Lookup</div>
          </div>
        </div>
      </header>

      <section className={styles.container} aria-label="Profile lookup">
        <div className={styles.card}>
          <h1 className={styles.title}>Find a profile</h1>
          <p className={styles.subtitle}>
            Search by an authorized identifier (internal ID). Access is logged.
          </p>

          <form onSubmit={handleSearch} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lookup">
                ID
              </label>
              <input
                id="lookup"
                className={styles.input}
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="e.g., UV-102938"
                autoComplete="off"
              />
              <div className={styles.hint}>
                Don’t use sensitive numbers (like SSN/national ID) as a lookup key in the UI.
              </div>
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isLoading}>
              {isLoading ? "Searching…" : "Search"}
            </button>

            {error && (
              <div className={styles.alert} role="alert">
                {error}
              </div>
            )}
          </form>

          {result && (
            <div className={styles.result} aria-label="Search result">
              <div className={styles.resultHeader}>Profile</div>

              <div className={styles.kv}>
                <div className={styles.k}>Internal ID</div>
                <div className={styles.v}>{result.internalId}</div>

                <div className={styles.k}>Name</div>
                <div className={styles.v}>{result.displayName}</div>

                <div className={styles.k}>Status</div>
                <div className={styles.v}>
                  <span className={result.status === "active" ? styles.badgeOk : styles.badgeMuted}>
                    {result.status}
                  </span>
                </div>

                <div className={styles.k}>Program</div>
                <div className={styles.v}>{result.program ?? "—"}</div>

                <div className={styles.k}>Last updated</div>
                <div className={styles.v}>
                  {new Date(result.lastUpdated).toLocaleString()}
                </div>
              </div>

              <div className={styles.actionsRow}>
                <Link className={styles.link} href="/dashboard">
                  Back to dashboard
                </Link>
                <Link className={styles.link} href="/help">
                  Help
                </Link>
              </div>
            </div>
          )}
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
          <Link className={styles.footerLink} href="/audit">
            Access logs
          </Link>
        </div>
      </footer>
    </main>
  );
}
