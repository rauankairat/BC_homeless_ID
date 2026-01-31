"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

type PackageRecord = {
  package_id: string;
  personal_id: string;
  shelter_id: string;
  status: string;
  arrival_date: string;
  expected_at: string;
  handout_date: string;
  ver_id: string;
};

export default function RegisterPackage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<PackageRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateId = (prefix: string) =>
    `${prefix}-` + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Required fields check (adjust if you want different required fields)
    const requiredFields = ["personal_id", "shelter_id", "status"];
    for (const field of requiredFields) {
      if (!form[field] || !form[field].trim()) {
        setError(`Field "${field}" is required.`);
        return;
      }
    }

    const pkg: PackageRecord = {
      package_id: generateId("P"),
      personal_id: form.personal_id.trim(),
      shelter_id: form.shelter_id.trim(),
      status: form.status.trim(),
      arrival_date: form.arrival_date?.trim() || "",
      expected_at: form.expected_at?.trim() || "",
      handout_date: form.handout_date?.trim() || "",
      ver_id: generateId("V"),
    };

    setSubmitted(pkg);
    console.log("Registered package:", pkg);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Package Registration</h1>
      </header>

      <section className={styles.container}>
        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <div className={styles.alert}>{error}</div>}

          <input
            name="personal_id"
            placeholder="Personal ID"
            value={form.personal_id || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="shelter_id"
            placeholder="Shelter ID"
            value={form.shelter_id || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="status"
            placeholder="Status (e.g., received, stored, handed_out)"
            value={form.status || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="arrival_date"
            type="date"
            placeholder="Arrival Date"
            value={form.arrival_date || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="expected_at"
            type="datetime-local"
            placeholder="Expected At"
            value={form.expected_at || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <input
            name="handout_date"
            type="date"
            placeholder="Handout Date"
            value={form.handout_date || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <button type="submit" className={styles.primaryButton}>
            Register
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
