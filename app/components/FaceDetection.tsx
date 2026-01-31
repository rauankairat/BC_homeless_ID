"use client";

import { useEffect, useRef, useState } from "react";

type FaceApi = typeof import("face-api.js");

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

        // Load models from /public/models
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

        // Start webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;

        // Wait until video has dimensions
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          video.addEventListener("loadedmetadata", onLoaded);
        });

        if (cancelled) return;

        setStatus("Loading enrolled labels...");

        const labeledFaceDescriptors = await getLabeledFaceDescriptions(faceapi);
        if (cancelled) return;

        if (labeledFaceDescriptors.length === 0) {
          setStatus('No enrolled people yet. Use "Register New Person" below.');
          // Still keep camera running; user can enroll now.
        } else {
          setStatus("Running...");
        }

        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

        const displaySize = {
          width: video.videoWidth || video.width,
          height: video.videoHeight || video.height,
        };

        // Match canvas size to video stream pixels (prevents box offset)
        canvas.width = displaySize.width;
        canvas.height = displaySize.height;

        // Clear old loop if any
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

          // If no enrolled labels, just draw boxes (no names)
          if (labeledFaceDescriptors.length === 0) {
            faceapi.draw.drawDetections(canvasRef.current, resized);
            return;
          }

          const results = resized.map((d) => faceMatcher.findBestMatch(d.descriptor));

          results.forEach((result, i) => {
            const box = resized[i]?.detection?.box;
            if (!box) return;

            const drawBox = new faceapi.draw.DrawBox(box, {
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
      <div className="relative w-[600px] h-[450px] overflow-hidden rounded-md border bg-black">
        <video
          ref={videoRef}
          width={600}
          height={450}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0"
        />
      </div>

      <div className="text-sm text-gray-600">{status}</div>
    </div>
  );
}

async function getLabeledFaceDescriptions(faceapi: FaceApi) {
  // Reads: /public/labels/index.json
  // Example content: { "Rauan": 3, "Max": 2 }
  const res = await fetch("/labels/index.json", { cache: "no-store" });

  // If index.json missing, treat as empty (no enrollments yet)
  if (!res.ok) return [];

  const index: Record<string, number> = await res.json();
  const labels = Object.keys(index);

  return Promise.all(
    labels.map(async (label) => {
      const descriptions: Float32Array[] = [];
      const count = index[label] ?? 0;

      for (let i = 1; i <= count; i++) {
        const img = await faceapi.fetchImage(`/labels/${label}/${i}.png`);
        const det = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!det) {
          console.warn(`No face found in /labels/${label}/${i}.png`);
          continue;
        }

        descriptions.push(det.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
