"use client";

import { mockPackages } from "../data/mockPackages"; // dummy data
import Link from "next/link";

export default function DisplayBoard() {
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

      {/* Main content */}
      <main className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24">
        <h1 className="text-4xl font-semibold text-center">
          Package Display Board
        </h1>
        <p className="mt-6 max-w-2xl text-center text-gray-600">
          All packages currently in the system.
        </p>

        {/* Row-by-row packages */}
        <div className="mt-12 w-full max-w-5xl space-y-4">
          {mockPackages.map((pkg) => (
            <div
              key={pkg.package_id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex justify-between items-center"
            >
              <div className="flex flex-col">
                <p className="font-medium text-lg">{pkg.recipient_name}</p>
                <p className="text-gray-500 text-sm">
                  Package: {pkg.package_id} | Personal ID: {pkg.personal_id}
                </p>
              </div>
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-semibold ${
                    pkg.status === "Arrived" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {pkg.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-md border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white"
          >
            Back to Home
          </Link>
          <Link
            href="/profile"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Profile Lookup
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
