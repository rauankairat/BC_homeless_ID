<<<<<<< HEAD
"use client";

import { useState } from "react";
import { mockPackages } from "../data/mockPackages";

export default function PackageLookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(mockPackages);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setResults(mockPackages);
      return;
    }

    const filtered = mockPackages.filter((pkg) =>
      pkg.personal_id.toLowerCase().includes(value.toLowerCase()) ||
      pkg.package_id.toLowerCase().includes(value.toLowerCase()) ||
      pkg.recipient_name.toLowerCase().includes(value.toLowerCase())
    );

    setResults(filtered);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h2 className="text-2xl font-semibold mb-6">Package Lookup</h2>

      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search by name, personal ID, or package ID"
        className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none mb-6"
      />

      <div className="space-y-4">
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
    </div>
  );
}
=======
>>>>>>> 93c06fe (push)
