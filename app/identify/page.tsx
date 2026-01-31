"use client";

import FaceDetection from "../components/FaceDetection";
import RegisterPersonInline from "../components/RegisterPersonInline";

export default function IdentifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-semibold">Face Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Verify a person, or enroll a new person below.
          </p>
        </header>

        <section className="rounded-lg bg-white p-6 shadow">
          <FaceDetection />
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="flex justify-center">
            <RegisterPersonInline />
          </div>
        </section>

        <div className="text-center text-xs text-gray-500">
          If you just enrolled someone, refresh this page to load the new labels.
        </div>
      </div>
    </div>
  );
}
