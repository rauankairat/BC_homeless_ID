"use client";

import { useEffect, useRef, useState } from "react";

type FaceApi = typeof import("face-api.js");

type PeopleIndex = {
  ok: boolean;
  people: { biometrics_id: string; photos: string[] }[];
  error?: string;
};

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  const [status, setStatus] = useState("Loading models...");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const faceapi: FaceApi = await import("face-api.js");

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);

        if (cancelled) return;

        setStatus("Starting camera...");

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
          setStatus("Missing video/canvas element.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;
        video.srcObject = stream;

        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          video.addEventListener("loadedmetadata", onLoaded);
        });

        if (cancelled) return;

        setStatus("Loading enrolled photos...");

        const labeledFaceDescriptors = await getLabeledFaceDescriptions(faceapi);

        if (cancelled) return;

        if (labeledFaceDescriptors.length === 0) {
          setStatus('No enrolled people yet. Enroll photos first.');
        } else {
          setStatus("Running...");
        }

        const faceMatcher =
          labeledFaceDescriptors.length > 0
            ? new faceapi.FaceMatcher(labeledFaceDescriptors)
            : null;

        const displaySize = {
          width: video.videoWidth || video.width,
          height: video.videoHeight || video.height,
        };

        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        if (intervalRef.current) window.clearInterval(intervalRef.current);

        intervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || !canvasRef.current) return;

          const detections = await faceapi
            .detectAllFaces(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptors();

          const resized = faceapi.resizeResults(detections, displaySize);

          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // No enrollments: draw only boxes
          if (!faceMatcher) {
            faceapi.draw.drawDetections(canvasRef.current, resized);
            return;
          }

          const results = resized.map((d) => faceMatcher.findBestMatch(d.descriptor));

          results.forEach((result, i) => {
            const box = resized[i]?.detection?.box;
            if (!box) return;

            const drawBox = new faceapi.draw.DrawBox(box, {
              // label is biometrics_id (or "unknown")
              label: result.toString(),
            });

            drawBox.draw(canvasRef.current!);
          });
        }, 120);
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("Error. Check console.");
      }
    };

    start();

    return () => {
      cancelled = true;

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[450px] w-[600px] overflow-hidden rounded-md border bg-black">
        <video
          ref={videoRef}
          width={600}
          height={450}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
      </div>

      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
}

async function getLabeledFaceDescriptions(faceapi: FaceApi) {
  const res = await fetch("/api/photos/index", { cache: "no-store" });
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.ok) return [];

  const people = data.people ?? [];

  const labeled = await Promise.all(
    people.map(async (p: { name: string; photos: string[] }) => {
      const descriptions: Float32Array[] = [];

      for (const url of p.photos) {
        try {
          const img = await faceapi.fetchImage(url);
          const det = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!det) continue;
          descriptions.push(det.descriptor);
        } catch {}
      }

      if (descriptions.length === 0) return null;

      // ✅ label is NAME now
      return new faceapi.LabeledFaceDescriptors(p.name, descriptions);
    })
  );

  return labeled.filter((x): x is NonNullable<typeof x> => Boolean(x));
}
