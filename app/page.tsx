"use client";

import Link from "next/link";

export default function Home() {
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
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#"
            className="rounded-md border border-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white"
          >
            Profile Lookup
          </a>
          <a
            href="#"
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
