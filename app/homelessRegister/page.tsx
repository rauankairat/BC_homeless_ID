"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

type PersonalInfoResponse = {
  personal_id: string;
  shelter_id: string;
  location_contact_id: string;
  biometrics_id: string;
  consent_id: string;

  first_name: string;
  middle_name: string | null;
  last_name: string;

  aliases: string[];
  past_names: string[];
  past_surnames: string[];

  DOB: string; // serialized ISO from server
  responsible_worker_ids: string[];
  referees: unknown;

  status: "active" | "inactive" | "deceased";
  creation_date: string;
  update_date: string;
};

export default function RegisterHomeless() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<PersonalInfoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const csvToArray = (value?: string) =>
    (value ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitted(null);

    // Required by your schema + route handler
    const requiredFields = ["shelter_id", "first_name", "last_name", "DOB"];
    for (const field of requiredFields) {
      if (!form[field] || !form[field].trim()) {
        setError(`Field "${field}" is required.`);
        return;
      }
    }

    const payload = {
      shelter_id: form.shelter_id.trim(),
      first_name: form.first_name.trim(),
      middle_name: form.middle_name?.trim() || undefined,
      last_name: form.last_name.trim(),

      aliases: csvToArray(form.aliases),
      past_names: csvToArray(form.past_names),
      past_surnames: csvToArray(form.past_surnames),

      DOB: form.DOB.trim(), // YYYY-MM-DD

      responsible_worker_ids: csvToArray(form.responsible_worker_ids),

      // `referees` is Json? in your schema.
      // We'll store it as an array of strings from the input.
      referees: csvToArray(form.referees),
    };

    try {
      setLoading(true);

      const res = await fetch("/api/personal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to register.");
        return;
      }

      setSubmitted(json.data as PersonalInfoResponse);
    } catch (err: any) {
      setError(err?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Homeless Registration</h1>
      </header>

      <section className={styles.container}>
        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <div className={styles.alert}>{error}</div>}

          {/* REQUIRED by schema */}
          <input
            name="shelter_id"
            placeholder="Shelter ID (UUID)"
            value={form.shelter_id || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="first_name"
            placeholder="First Name"
            value={form.first_name || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="middle_name"
            placeholder="Middle Name"
            value={form.middle_name || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="aliases"
            placeholder="Aliases (comma separated)"
            value={form.aliases || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="past_names"
            placeholder="Past Names (comma separated)"
            value={form.past_names || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="past_surnames"
            placeholder="Past Surnames (comma separated)"
            value={form.past_surnames || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="DOB"
            type="date"
            placeholder="Date of Birth"
            value={form.DOB || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="responsible_worker_ids"
            placeholder="Responsible Worker IDs (UUIDs, comma separated)"
            value={form.responsible_worker_ids || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="referees"
            placeholder="Referees (comma separated)"
            value={form.referees || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {submitted && (
          <div className={styles.card} style={{ marginTop: "24px" }}>
            <h2>Registration Successful!</h2>
            <pre>{JSON.stringify(submitted, null, 2)}</pre>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <Link href="/" className={styles.link}>
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
