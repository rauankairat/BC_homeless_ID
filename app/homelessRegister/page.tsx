"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

type HomelessPerson = {
  personal_id: string;
  photo_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  aliases: string[];
  past_names: string[];
  past_surnames: string[];
  preferred_name?: string;
  DOB: string;
  responsible_worker_ids: string[];
  referees: string[];
  consent_id: string;
};

export default function RegisterHomeless() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<HomelessPerson | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple unique ID generator
  const generateId = () => "H-" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Required fields check
    const requiredFields = ["first_name", "last_name", "DOB"];
    for (const field of requiredFields) {
      if (!form[field] || !form[field].trim()) {
        setError(`Field "${field}" is required.`);
        return;
      }
    }

    // Build HomelessPerson object
    const person: HomelessPerson = {
      personal_id: generateId(),
      photo_id: generateId(),
      first_name: form.first_name.trim(),
      middle_name: form.middle_name?.trim() || "",
      last_name: form.last_name.trim(),
      aliases: form.aliases ? form.aliases.split(",").map(s => s.trim()) : [],
      past_names: form.past_names ? form.past_names.split(",").map(s => s.trim()) : [],
      past_surnames: form.past_surnames ? form.past_surnames.split(",").map(s => s.trim()) : [],
      preferred_name: form.preferred_name?.trim() || "",
      DOB: form.DOB.trim(),
      responsible_worker_ids: form.responsible_worker_ids ? form.responsible_worker_ids.split(",").map(s => s.trim()) : [],
      referees: form.referees ? form.referees.split(",").map(s => s.trim()) : [],
      consent_id: generateId(),
    };

    // For now, just show submitted data
    setSubmitted(person);
    console.log("Registered homeless person:", person);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Homeless Registration</h1>
      </header>

      <section className={styles.container}>
        <form className={styles.card} onSubmit={handleSubmit}>
          {error && <div className={styles.alert}>{error}</div>}

          <input name="first_name" placeholder="First Name" value={form.first_name || ""} onChange={handleChange} className={styles.input} />
          <input name="middle_name" placeholder="Middle Name" value={form.middle_name || ""} onChange={handleChange} className={styles.input} />
          <input name="last_name" placeholder="Last Name" value={form.last_name || ""} onChange={handleChange} className={styles.input} />
          <input name="aliases" placeholder="Aliases (comma separated)" value={form.aliases || ""} onChange={handleChange} className={styles.input} />
          <input name="past_names" placeholder="Past Names (comma separated)" value={form.past_names || ""} onChange={handleChange} className={styles.input} />
          <input name="past_surnames" placeholder="Past Surnames (comma separated)" value={form.past_surnames || ""} onChange={handleChange} className={styles.input} />
          <input name="preferred_name" placeholder="Preferred Name" value={form.preferred_name || ""} onChange={handleChange} className={styles.input} />
          <input name="DOB" type="date" placeholder="Date of Birth" value={form.DOB || ""} onChange={handleChange} className={styles.input} />
          <input name="responsible_worker_ids" placeholder="Responsible Worker IDs (comma separated)" value={form.responsible_worker_ids || ""} onChange={handleChange} className={styles.input} />
          <input name="referees" placeholder="Referees (comma separated)" value={form.referees || ""} onChange={handleChange} className={styles.input} />

          <button type="submit" className={styles.primaryButton}>Register</button>
        </form>

        {submitted && (
          <div className={styles.card} style={{ marginTop: "24px" }}>
            <h2>Registration Successful!</h2>
            <pre>{JSON.stringify(submitted, null, 2)}</pre>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
          <Link href="/" className={styles.link}>Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
