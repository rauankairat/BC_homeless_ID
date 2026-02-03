"use client";

import { useEffect, useRef } from "react";

interface Shelter {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  services?: string;
}

interface InteractiveMapProps {
  shelters: Shelter[];
  highlightedShelterId?: number;
}

export default function InteractiveMap({ shelters, highlightedShelterId }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      // @ts-expect-error -- leaflet css import not recognized by next.js types
      await import("leaflet/dist/leaflet.css");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current).setView([48.4284, -123.3656], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      shelters.forEach((shelter) => {
        const isHighlighted = shelter.id === highlightedShelterId;

        const icon = isHighlighted
          ? L.divIcon({
            className: "custom-marker",
            html: `
                <style>
                  @keyframes pulse {
                    0% {
                      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                    }
                    70% {
                      box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
                    }
                    100% {
                      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
                    }
                  }
                </style>
                <div style="
                  background-color: #ef4444;
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  border: 3px solid white;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                "></div>
              `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          })
          : L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          });

        const marker = L.marker([shelter.lat, shelter.lng], { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="font-size: 14px;">${shelter.name}</strong><br/>
              <span style="font-size: 12px; color: #666;">${shelter.address}</span><br/>
              ${shelter.services ? `
              <span style="font-size: 12px; margin-top: 4px; display: block;">
                <strong>Services:</strong> ${shelter.services}
              </span>
              ` : ''}
              ${isHighlighted ? '<br/><span style="color: #ef4444; font-weight: bold;">📬 Mail Location</span>' : ''}
            </div>
          `);

        markersRef.current.push(marker);

        if (isHighlighted) {
          marker.openPopup();
          mapInstanceRef.current.flyTo([shelter.lat, shelter.lng], 16, {
            duration: 2.5,
            easeLinearity: 0.15
          });
        }
      });
    };

    initMap();

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, [shelters, highlightedShelterId]);

  return <div ref={mapRef} className="w-full h-full min-h-[600px]" />;
}