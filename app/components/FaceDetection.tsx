"use client";

import { useEffect, useRef, useState } from "react";

// Face-api.js is a browser-only library. In Next.js App Router we run it in a Client Component
// and dynamically import it inside useEffect to avoid SSR issues.

type FaceApi = typeof import("face-api.js");

export default function FaceDetection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<string>("Loading models...");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const faceapi: FaceApi = await import("face-api.js");

        // 1) Load models from /public/models
        // Put the face-api model files in: public/models/
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);

        if (cancelled) return;
        setStatus("Starting camera...");

        // 2) Start webcam
        const videoEl = videoRef.current;
        if (!videoEl) {
          setStatus("Video element not found.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        videoEl.srcObject = stream;

        // Wait for video metadata so width/height are known
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            videoEl.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          videoEl.addEventListener("loadedmetadata", onLoaded);
        });

        if (cancelled) return;

        // 3) Prepare labeled descriptors (from /public/labels/...)
        setStatus("Loading labeled faces...");

        const labeledFaceDescriptors = await getLabeledFaceDescriptions(faceapi);
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

        if (cancelled) return;

        // 4) Setup canvas overlay
        const canvasEl = canvasRef.current;
        if (!canvasEl) {
          setStatus("Canvas element not found.");
          return;
        }

        const displaySize = {
          width: videoEl.videoWidth || videoEl.width,
          height: videoEl.videoHeight || videoEl.height,
        };

        // Set both CSS size and pixel buffer size
        canvasEl.width = displaySize.width;
        canvasEl.height = displaySize.height;

        setStatus("Running...");

        // 5) Detect loop
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
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

          const results = resized.map((d) => faceMatcher.findBestMatch(d.descriptor));

          results.forEach((result, i) => {
            const box = resized[i]?.detection?.box;
            if (!box) return;
            const drawBox = new faceapi.draw.DrawBox(box, {
              label: result.toString(),
            });
            drawBox.draw(canvasEl);
          });
        }, 100);
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("Error. Check console.");
      }
    };

    start();

    return () => {
      cancelled = true;

      // Stop interval
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Stop webcam
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // Detach stream from video
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
    <div style={styles.page}>
      <div style={styles.stage}>
        <video
          ref={videoRef}
          id="video"
          width={600}
          height={450}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>

      <div style={styles.status} aria-live="polite">
        {status}
      </div>
    </div>
  );
}

async function getLabeledFaceDescriptions(faceapi: FaceApi) {
  // Your original labels array
  const labels = ["Rauan", "Max", "Nawfal"];

  return Promise.all(
    labels.map(async (label) => {
      const descriptions: Float32Array[] = [];

      for (let i = 1; i <= 2; i++) {
        // IMPORTANT:
        // Put images in: public/labels/<Label>/<i>.png
        // Example: public/labels/Messi/1.png
        const img = await faceapi.fetchImage(`/labels/${label}/${i}.png`);

        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detections) {
          // Avoid crashing if an image has no detectable face
          // You can log which file failed
          console.warn(`No face found in /labels/${label}/${i}.png`);
          continue;
        }

        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

// Inline styles to match your CSS (body full screen center + absolute canvas)
const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 0,
    margin: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  stage: {
    position: "relative",
    width: 600,
    height: 450,
  },
  video: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  status: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
    fontSize: 14,
    opacity: 0.85,
  },
};

/*
--- HOW TO USE IN NEXT.JS (App Router) ---

1) Install face-api.js
   npm i face-api.js

2) Put face-api model files into:
   public/models/

   (ssd_mobilenetv1 model + face_landmark_68 + face_recognition)

3) Put labeled images into:
   public/labels/Felipe/1.png
   public/labels/Felipe/2.png
   public/labels/Messi/1.png
   public/labels/Messi/2.png
   public/labels/Data/1.png
   public/labels/Data/2.png

4) Create a page like app/identify/page.tsx:

   import FaceDetection from "@/components/FaceDetection";

   export default function Page() {
     return <FaceDetection />;
   }

Notes:
- Must run over https:// or localhost for webcam permissions.
- If you get a black video on iOS Safari, keep playsInline + muted.
- If detection boxes feel offset, ensure stage width/height matches video.
*/
