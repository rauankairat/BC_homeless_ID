"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FaceDetection from "../components/FaceDetection";
import RegisterPersonInline from "../components/RegisterPersonInline";

type Mode = "recognize" | "enroll";

export default function IdentifyPage() {
  const [mode, setMode] = useState<Mode>("recognize");

  const modeLabel = useMemo(() => {
    return mode === "recognize" ? "Face Verification" : "Register New Person";
  }, [mode]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar (matches your Home style) */}
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
            <Link href="/registration" className="text-gray-700 hover:text-black">
              Registration
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-black">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold leading-tight">{modeLabel}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify identity with face recognition, or enroll someone new with a quick capture.
          </p>
        </div>

        {/* Mode switch */}
        <div className="mx-auto mb-8 flex w-full max-w-xl items-center rounded-lg border bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("recognize")}
            className={[
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition",
              mode === "recognize"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            Recognition
          </button>
          <button
            type="button"
            onClick={() => setMode("enroll")}
            className={[
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition",
              mode === "enroll"
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            Add Person
          </button>
        </div>

        {/* Card */}
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          {mode === "recognize" ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Live Verification</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Aim the camera at the person. If they are enrolled, their name should appear.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("enroll")}
                  className="rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white"
                >
                  + Enroll new person
                </button>
              </div>

              <div className="flex justify-center">
                <FaceDetection />
              </div>

              <div className="text-center text-xs text-gray-500">
                Tip: if you just enrolled someone, refresh or switch modes to reload labels.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Enrollment</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter a name, capture a photo, and save it to the labels dataset.
                    Repeat 2–5 times for better accuracy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("recognize")}
                  className="rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white"
                >
                  ← Back to recognition
                </button>
              </div>

              <div className="flex justify-center">
                <RegisterPersonInline />
              </div>

              <div className="text-center text-xs text-gray-500">
                After saving, switch back to Recognition and test.
              </div>
            </div>
          )}
        </section>

        {/* Footer helper links */}
        <div className="mt-8 flex flex-col items-center gap-2 text-xs text-gray-500">
          <div>
            Having issues? Check models at{" "}
            <span className="font-mono">/models/</span> and labels at{" "}
            <span className="font-mono">/labels/</span>.
          </div>
          <div className="hidden md:block">
            Suggested flow: Add Person → capture 3 photos → Recognition → verify.
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6 text-center text-xs text-gray-500">
        © 2026 Random Company! · Built for Inspire Hackathon 2026
      </footer>
    </div>
  );
}
