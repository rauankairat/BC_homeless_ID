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

  // Victoria BC Homeless Shelters
  const shelters = [
    {
      id: 1,
      name: "Our Place Society",
      address: "919 Pandora Ave, Victoria, BC",
      lat: 48.4284,
      lng: -123.3656,
      services: "Meals, Showers, Health Services, Housing Support"
    },
    {
      id: 2,
      name: "The Mustard Seed",
      address: "625 Queens Ave, Victoria, BC",
      lat: 48.4312,
      lng: -123.3589,
      services: "Emergency Shelter, Meals, Support Programs"
    },
    {
      id: 3,
      name: "Cool Aid Community Health Centre",
      address: "713 Johnson St, Victoria, BC",
      lat: 48.4275,
      lng: -123.3621,
      services: "Healthcare, Housing Support, Outreach"
    },
    {
      id: 4,
      name: "Victoria Native Friendship Centre",
      address: "231 Regina Ave, Victoria, BC",
      lat: 48.4398,
      lng: -123.3542,
      services: "Cultural Support, Housing Programs, Community Services"
    },
    {
      id: 5,
      name: "Beacon Community Services",
      address: "3318 Oak St, Victoria, BC",
      lat: 48.4521,
      lng: -123.3298,
      services: "Transitional Housing, Mental Health Support"
    }
  ];

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
            <Link href="/display" className="text-gray-700 hover:text-black">Display</Link>
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
            placeholder="Search by name, ID or package number"
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
          <Link
            href="profile"
            className="rounded-md border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white"
          >
            Profile Lookup
          </Link>
          <Link
            href="/homelessRegister"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Register Individual
          </Link>
        </div>
      </main>

      {/* Shelters Map Section */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-semibold text-center mb-4">
            Victoria BC Homeless Shelters & Services
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find nearby shelters and support services in the Greater Victoria area
          </p>

          {/* Map */}
          <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 h-[600px] mb-12">
            <iframe
              src="https://www.google.com/maps/d/u/0/embed?mid=1i6_vj511WmdhEkQ7KWRBwEZQ0xXqOKQ&ehbc=2E312F"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Victoria BC Homeless Shelters Map"
            ></iframe>
          </div>



          {/* Shelter List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shelters.map((shelter) => (
              <div
                key={shelter.id}
                className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{shelter.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {shelter.address}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Services:</span> {shelter.services}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Get Directions →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
        © 2026 Random Company! · Built for Inspire Hackathon 2026
      </footer>
    </div>
  );
}