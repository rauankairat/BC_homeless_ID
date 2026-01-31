"use client";

import { useEffect, useRef, useState } from "react";

export default function RegisterPersonInline() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [biometricsId, setBiometricsId] = useState("");
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
      const id = biometricsId.trim();

      if (!id) {
        setStatus("Enter biometrics_id first.");
        return;
      }

      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRe.test(id)) {
        setStatus("biometrics_id must be a valid UUID.");
        return;
      }

      const video = videoRef.current;
      if (!video) {
        setStatus("No video element.");
        return;
      }

      if (!video.videoWidth || !video.videoHeight) {
        setStatus("Camera not ready yet (try again in a second).");
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setStatus("Canvas context unavailable.");
        return;
      }

      ctx.drawImage(video, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) {
        setStatus("Failed to capture image.");
        return;
      }

      setStatus("Uploading... (check console for raw response)");

      const form = new FormData();
      form.append("biometrics_id", id);
      form.append("file", blob, "capture.png");

      const res = await fetch("/api/labels/enroll", {
        method: "POST",
        body: form,
      });

      // ✅ Explicit debug: always read raw text first
      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();

      console.log("UPLOAD =>", {
        url: "/api/labels/enroll",
        status: res.status,
        statusText: res.statusText,
        contentType,
        rawPreview: raw.slice(0, 500),
        raw,
      });

      // ✅ Show EXACT failure
      if (!res.ok) {
        setStatus(`HTTP ${res.status} ${res.statusText}: ${raw.slice(0, 300)}`);
        return;
      }

      // ✅ Parse JSON if possible
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        setStatus(`OK but non-JSON response: ${raw.slice(0, 300)}`);
        return;
      }

      if (!data?.ok) {
        setStatus(data?.error ?? "Upload failed (ok=false).");
        return;
      }

      setStatus(`Saved: ${data.savedAs}`);
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
          placeholder="biometrics_id (UUID) e.g. 3f1c2d... "
          value={biometricsId}
          onChange={(e) => setBiometricsId(e.target.value)}
        />
        <button
          onClick={captureAndUpload}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Capture &amp; Save
        </button>
      </div>

      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}

      <p className="mt-2 text-xs text-gray-500">
        Tip: take 2–5 shots (different angles/lighting) for better matching.
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Debug: open DevTools Console + Network. This page prints raw API response every time.
      </p>
    </div>
  );
}
