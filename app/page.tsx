"use client";

import { mockPackages } from "./data/mockPackages";
import Link from "next/link";

import { useEffect, useState } from "react";

type Shelter = {
  shelter_id: string;
  address: string;
  email: string | null;
  phone: string | null;
  status: "open" | "closed" | string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [sheltersLoading, setSheltersLoading] = useState(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/packages/search?q=${encodeURIComponent(q)}`);
        setResults(await res.json());
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    (async () => {
      setSheltersLoading(true);
      try {
        // Optional filter: ?status=open
        const res = await fetch("/api/shelters?status=open", { cache: "no-store" });
        const data = await res.json();

        // Defensive: ensure array
        setShelters(Array.isArray(data) ? data : []);
      } catch (e) {
        setShelters([]);
      } finally {
        setSheltersLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="w-full border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold tracking-tight">
            BC Homeless ID Portal
          </div>

          <div className="hidden gap-6 text-sm md:flex">
            <Link href="/" className="text-gray-700 hover:text-black">
              Home
            </Link>
            <Link href="/display" className="text-gray-700 hover:text-black">
              Display
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-black">
              Profile Lookup
            </Link>
            <Link
              href="/registration"
              className="text-gray-700 hover:text-black"
            >
              Registration
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-black">
              Login
            </Link>
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
          in reconnecting individuals with essential identification and mail
          services.
        </p>

        {/* Search Bar */}
        <div className="mt-12 w-full max-w-xl">
          <input
            type="text"
            placeholder="Search by name, ID or package number"
            value={query}
            onChange={handleSearch}
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>

        {/* Inline Search Results */}
        {query && (
          <div className="mt-6 w-full max-w-xl space-y-4">
            {results.length === 0 && (
              <p className="text-gray-500">No packages found.</p>
            )}

            {results.map((pkg) => (
              <div
                key={pkg.package_id}
                className="flex items-center justify-between rounded-md border bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">{pkg.recipient_name}</p>
                  <p className="text-sm text-gray-500">
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
          {/* ➕ Add Package */}
          <Link
            href="/package"
            className="rounded-md border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white"
          >
            Add Package
          </Link>

          {/* Face Verification */}
          <Link
            href="/identify"
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Face Verification
          </Link>

          {/* Register Individual */}
          <Link
            href="/homelessRegister"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Register Individual
          </Link>
        </div>
      </main>

      {/* Shelters Section */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-4 text-center text-3xl font-semibold">
            Victoria BC Homeless Shelters & Services
          </h2>

          <div className="mb-12 h-[600px] overflow-hidden rounded-lg border border-gray-200 shadow-lg">
            <iframe
              src="https://www.google.com/maps/d/u/0/embed?mid=1i6_vj511WmdhEkQ7KWRBwEZQ0xXqOKQ&ehbc=2E312F"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Victoria BC Homeless Shelters Map"
            />
          </div>

<<<<<<< HEAD
          {/* Shelter List */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shelters.map((shelter) => (
              <div
                key={shelter.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5 transition-shadow hover:shadow-md"
              >
                <h3 className="mb-2 text-lg font-semibold">{shelter.name}</h3>
                <p className="mb-2 text-sm text-gray-600">
                  {shelter.address}
                </p>
                <p className="mb-3 text-sm text-gray-700">
                  <span className="font-medium">Services:</span>{" "}
                  {shelter.services}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Get Directions →
                </a>
              </div>
            ))}
          </div>
=======
          {sheltersLoading ? (
            <p className="text-center text-gray-500">Loading shelters…</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shelters.map((shelter) => {
                const hasCoords = shelter.latitude != null && shelter.longitude != null;

                return (
                  <div key={shelter.shelter_id} className="rounded-lg border border-gray-200 bg-gray-50 p-5 transition-shadow hover:shadow-md">
                    <h3 className="mb-2 text-lg font-semibold">
                      Shelter {shelter.shelter_id.slice(0, 8)}
                    </h3>

                    <p className="mb-2 text-sm text-gray-600">{shelter.address}</p>

                    {/* Contacts */}
                    <div className="mb-3 space-y-1 text-sm text-gray-700">
                      {shelter.email && (
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          <a href={`mailto:${shelter.email}`} className="text-blue-600 hover:underline">
                            {shelter.email}
                          </a>
                        </p>
                      )}

                      {shelter.phone && (
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          <a href={`tel:${shelter.phone}`} className="text-blue-600 hover:underline">
                            {shelter.phone}
                          </a>
                        </p>
                      )}

                      {!shelter.email && !shelter.phone && (
                        <p className="text-gray-500">No contact info available</p>
                      )}
                    </div>

                    {hasCoords ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Get Directions →
                      </a>
                    ) : (
                      <span className="inline-block text-sm text-gray-500">
                        No coordinates on file
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
>>>>>>> 6e97cb3 (backend integration package + map + profile + register)
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
        © 2026 Random Company! · Built for Inspire Hackathon 2026
      </footer>
    </div>
  );
}

  