"use client";

import { useEffect, useRef, useState } from "react";

export default function RegisterPersonInline() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStatus("Starting camera...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("");
      } catch (e) {
        console.error(e);
        setStatus("Camera permission denied or unavailable.");
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try {
          (videoRef.current as any).srcObject = null;
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const captureAndUpload = async () => {
    try {
      const person = name.trim();
      if (!person) {
        setStatus("Enter a name first.");
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) {
        setStatus("Failed to capture image.");
        return;
      }

      setStatus("Uploading...");

      const form = new FormData();
      form.append("name", person);
      form.append("file", blob, "capture.png");

      const res = await fetch("/api/labels/enroll", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus(data?.error ?? "Upload failed");
        return;
      }

      setStatus(`Saved: ${data.savedAs} (refresh to verify)`);
    } catch (e) {
      console.error(e);
      setStatus("Upload failed. Check console.");
    }
  };

  return (
    <div className="w-full max-w-xl rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Register New Person</h3>

      <div className="mt-3 overflow-hidden rounded-md border bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full" />
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
          placeholder="Name (folder label) e.g. Rauan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={captureAndUpload}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Capture & Save
        </button>
      </div>

      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}

      <p className="mt-2 text-xs text-gray-500">
        Tip: take 2–5 shots (different angles/lighting) for better matching.
      </p>
    </div>
  );
}
