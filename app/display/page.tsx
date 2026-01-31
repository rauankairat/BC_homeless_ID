"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Package {
  package_id: string;
  personal_id: string;
  recipient_name: string;
  status: string;
  arrival_date?: string;
  expected_at?: string;
  handout_date?: string;
  operator?: string;
  shelter_id?: string;
  verification_log_id?: string;
}

export default function DetailedPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [shelterIdInput, setShelterIdInput] = useState<string>("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (statusFilter) params.append("status", statusFilter);
        if (shelterIdInput.trim()) params.append("shelter_id", shelterIdInput.trim());

        const url = `/api/packages/detailed?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch packages: ${response.statusText}`);
        }

        const data = await response.json();
        setPackages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load packages");
        console.error("Error fetching packages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, [statusFilter, shelterIdInput]);

  const formatOperator = (operator?: string) => {
    if (!operator) return "Unknown";
    return operator
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
            <Link href="/display" className="text-gray-700 hover:text-black">Display</Link>
            <Link href="/packages/detailed" className="text-gray-700 hover:text-black">Detailed Packages</Link>
            <Link href="/profile" className="text-gray-700 hover:text-black">Profile Lookup</Link>
            <Link href="/registration" className="text-gray-700 hover:text-black">Registration</Link>
            <Link href="/login" className="text-gray-700 hover:text-black">Login</Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24">
        <h1 className="text-4xl font-semibold text-center">
          Package Details
        </h1>
        <p className="mt-6 max-w-2xl text-center text-gray-600">
          Detailed view of all packages in the system, sorted by arrival date.
        </p>

        {/* Filter Controls */}
        <div className="mt-8 w-full max-w-6xl space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "" 
                    ? "bg-black text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "pending" 
                    ? "bg-black text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("received")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "received" 
                    ? "bg-black text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Received
              </button>
              <button
                onClick={() => setStatusFilter("ready")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "ready" 
                    ? "bg-black text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Ready
              </button>
              <button
                onClick={() => setStatusFilter("handed_out")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === "handed_out" 
                    ? "bg-black text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Handed Out
              </button>
            </div>
          </div>

          {/* Shelter ID Filter */}
          <div>
            <label htmlFor="shelter-input" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Shelter ID
            </label>
            <input
              id="shelter-input"
              type="text"
              value={shelterIdInput}
              onChange={(e) => setShelterIdInput(e.target.value)}
              placeholder="Enter shelter UUID"
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Active Filters Display */}
          {(statusFilter || shelterIdInput) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {statusFilter && (
                <span className="px-3 py-1 bg-black text-white text-sm rounded-full flex items-center gap-2">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("")}
                    className="hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              )}
              {shelterIdInput && (
                <span className="px-3 py-1 bg-black text-white text-sm rounded-full flex items-center gap-2">
                  Shelter: {shelterIdInput.slice(0, 8)}...
                  <button
                    onClick={() => setShelterIdInput("")}
                    className="hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-12 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-12 w-full max-w-6xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-semibold mb-2">Error loading packages</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && packages.length === 0 && (
          <div className="mt-12 w-full max-w-6xl">
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                No packages found with the selected filters.
              </p>
            </div>
          </div>
        )}

        {/* Detailed Package Cards */}
        {!isLoading && !error && packages.length > 0 && (
          <div className="mt-12 w-full max-w-6xl space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.package_id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-xl mb-1">{pkg.recipient_name}</p>
                    <p className="text-gray-500 text-xs font-mono break-all">
                      {pkg.package_id}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap self-start bg-gray-100 text-gray-700">
                    {pkg.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Package Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {/* Operator */}
                  <div>
                    <p className="font-medium text-gray-700">Carrier</p>
                    <p className="text-gray-900">{formatOperator(pkg.operator)}</p>
                  </div>

                  {/* Arrival Date */}
                  {pkg.arrival_date && (
                    <div>
                      <p className="font-medium text-gray-700">Arrived</p>
                      <p className="text-gray-900">
                        {new Date(pkg.arrival_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Expected Date */}
                  {pkg.expected_at && (
                    <div>
                      <p className="font-medium text-gray-700">Expected</p>
                      <p className="text-gray-900">
                        {new Date(pkg.expected_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Handout Date */}
                  {pkg.handout_date && (
                    <div>
                      <p className="font-medium text-gray-700">Handed Out</p>
                      <p className="text-gray-900">
                        {new Date(pkg.handout_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Shelter ID */}
                  {pkg.shelter_id && (
                    <div>
                      <p className="font-medium text-gray-700">Shelter ID</p>
                      <p className="text-gray-900 font-mono text-xs break-all">
                        {pkg.shelter_id.slice(0, 8)}...
                      </p>
                    </div>
                  )}

                  {/* Verification Log ID */}
                  {pkg.verification_log_id && (
                    <div>
                      <p className="font-medium text-gray-700">Verification Log</p>
                      <p className="text-gray-900 font-mono text-xs break-all">
                        {pkg.verification_log_id.slice(0, 8)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Package Count */}
        {!isLoading && !error && packages.length > 0 && (
          <p className="mt-6 text-gray-500 text-sm">
            Showing {packages.length} package{packages.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-md border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/display"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Simple Display
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
        © 2026 Random Company! · Built for Inspire Hackathon 2026
      </footer>
    </div>
  );
}