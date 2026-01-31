"use client";

import { useState } from "react";
import { mockPackages } from "./data/mockPackages";
import Link from "next/link";

export default function Home() {
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(mockPackages);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setResults(mockPackages);
      return;
    }

    const filtered = mockPackages.filter(
      (pkg) =>
        pkg.personal_id.toLowerCase().includes(value.toLowerCase()) ||
        pkg.package_id.toLowerCase().includes(value.toLowerCase()) ||
        pkg.recipient_name.toLowerCase().includes(value.toLowerCase())
    );

    setResults(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="w-full border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">
            BC Homeless ID Portal
          </div>

          <div className="hidden gap-6 text-sm md:flex">
            <Link href="/" className="text-gray-700 hover:text-black">Home</Link>
            <Link href="/profile" className="text-gray-700 hover:text-black">Profile Lookup</Link>
            <Link href="/registration" className="text-gray-700 hover:text-black">Registration</Link>
            <Link href="/login" className="text-gray-700 hover:text-black">Login</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight">
          Access to Identity. Access to Services.
        </h1>

        <p className="mt-6 max-w-2xl text-gray-600">
          A secure, low-friction system supporting shelters and outreach workers
          in reconnecting individuals with essential identification and mail services.
        </p>

        {/* Search Bar */}
        <div className="mt-12 w-full max-w-xl">
          <input
            type="text"
            placeholder="Search by name, ID or package numeber"
            value={query}
            onChange={handleSearch}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>

        {/* Inline Search Results */}
        {query && (
          <div className="mt-6 w-full max-w-xl space-y-4">
            {results.length === 0 && <p className="text-gray-500">No packages found.</p>}

            {results.map((pkg) => (
              <div
                key={pkg.package_id}
                className="border rounded-md p-4 bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{pkg.recipient_name}</p>
                  <p className="text-gray-500 text-sm">
                    Package: {pkg.package_id} | Personal ID: {pkg.personal_id}
                  </p>
                </div>
                <div className="text-sm font-semibold">
                  {pkg.status === "Arrived" ? (
                    <span className="text-green-600">{pkg.status}</span>
                  ) : (
                    <span className="text-gray-400">{pkg.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#"
            className="rounded-md border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white"
          >
            Profile Lookup
          </a>
          <a
            href="/registration"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Register Individual
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
        © 2026 Random Company! · Built for Inspire Hackathon 2026
      </footer>
    </div>
  );
}
