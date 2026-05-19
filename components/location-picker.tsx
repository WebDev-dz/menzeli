"use client";

/**
 * LocationPicker.tsx
 *
 * A Mapbox-powered map for the property form.
 * - Click anywhere on the map to drop a marker
 * - Drag the marker to fine-tune
 * - Reverse geocodes the position → fills street address
 * - Emits { lat, lng, address } to parent via onChange
 *
 * Usage:
 *   <LocationPicker
 *     value={{ lat: 36.7, lng: 3.08, address: "..." }}
 *     onChange={({ lat, lng, address }) => { ... }}
 *   />
 */

import { useEffect, useRef, useCallback, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, MapPin, LocateFixed, X } from "lucide-react";

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const ALGERIA_CENTER: [number, number] = [3.0, 36.5];
const DEFAULT_ZOOM = 5;

export interface LocationValue {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerProps {
  value?: LocationValue;
  onChange?: (value: LocationValue) => void;
  /** Optional: restrict geocoding to this country (default: DZ) */
  country?: string;
}

async function reverseGeocode(
  lng: number,
  lat: number,
  token: string,
  country = "dz"
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=ar&country=${country}&types=address,place,locality,neighborhood`
    );
    const data = await res.json();
    return data.features?.[0]?.place_name ?? "";
  } catch {
    return "";
  }
}

export default function LocationPicker({
  value,
  onChange,
  country = "dz",
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapboxRef = useRef<any>(null);
  const mapRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [address, setAddress] = useState(value?.address ?? "");
  const [hasPin, setHasPin] = useState(!!value?.lat);

  // ── Place / move marker ──────────────────────────────────────────────────
  const placeMarker = useCallback(
    async (lng: number, lat: number) => {
      const mapboxgl = mapboxRef.current;
      const map = mapRef.current;
      if (!map || !mapboxgl) return;

      // Create or move marker
      if (!markerRef.current) {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            display:flex;flex-direction:column;align-items:center;
            filter: drop-shadow(0 4px 8px rgba(26,86,219,0.4));
          ">
            <div style="
              background:#1a56db;
              width:32px;height:32px;
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid #fff;
              display:flex;align-items:center;justify-content:center;
            ">
              <div style="
                width:10px;height:10px;
                background:#fff;
                border-radius:50%;
                transform:rotate(45deg);
              "></div>
            </div>
          </div>
        `;
        el.style.cursor = "grab";

        markerRef.current = new mapboxgl.Marker({
          element: el,
          draggable: true,
          anchor: "bottom",
          offset: [0, 6],
        })
          .setLngLat([lng, lat])
          .addTo(map);

        // Drag end → reverse geocode new position
        markerRef.current.on("dragend", async () => {
          const pos = markerRef.current!.getLngLat();
          setIsGeocoding(true);
          const addr = await reverseGeocode(
            pos.lng,
            pos.lat,
            MAPBOX_ACCESS_TOKEN,
            country
          );
          setAddress(addr);
          setIsGeocoding(false);
          onChange?.({ lat: pos.lat, lng: pos.lng, address: addr });
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      setHasPin(true);

      // Smooth fly to pin
      map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13), duration: 600 });

      // Reverse geocode
      setIsGeocoding(true);
      const addr = await reverseGeocode(lng, lat, MAPBOX_ACCESS_TOKEN, country);
      setAddress(addr);
      setIsGeocoding(false);
      onChange?.({ lat, lng, address: addr });
    },
    [onChange, country]
  );

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    if (!MAPBOX_ACCESS_TOKEN) return;

    let cancelled = false;
    let map: any | null = null;

    (async () => {
      const mapboxModule = await import("mapbox-gl");
      if (cancelled) return;

      const mapboxgl = (mapboxModule as any).default ?? mapboxModule;
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      mapboxRef.current = mapboxgl;

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: value ? [value.lng, value.lat] : ALGERIA_CENTER,
        zoom: value ? 13 : DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "bottom-left"
      );
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      // Click to place marker
      map.on("click", (e: any) => {
        placeMarker(e.lngLat.lng, e.lngLat.lat);
      });

      // Change cursor on hover
      map.on("mousemove", () => {
        map.getCanvas().style.cursor = "crosshair";
      });

      mapRef.current = map;

      // If value already set, place marker immediately
      if (value?.lat && value?.lng) {
        map.on("load", () => placeMarker(value.lng!, value.lat!));
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markerRef.current = null;
      mapboxRef.current = null;
    };
  }, []);

  // ── "Use my location" ────────────────────────────────────────────────────
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => placeMarker(coords.longitude, coords.latitude),
      () => {}
    );
  };

  // ── Remove marker ────────────────────────────────────────────────────────
  const clearPin = () => {
    markerRef.current?.remove();
    markerRef.current = null;
    setHasPin(false);
    setAddress("");
    onChange?.({ lat: 0, lng: 0, address: "" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Map container */}
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        <div ref={containerRef} style={{ width: "100%", height: 280 }} />

        {/* Top-right controls */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            zIndex: 5,
          }}
        >
          {/* Use my location */}
          <button
            type="button"
            onClick={useMyLocation}
            title="استخدم موقعي الحالي"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#1a56db",
            }}
          >
            <LocateFixed style={{ width: 16, height: 16 }} />
          </button>

          {/* Clear pin */}
          {hasPin && (
            <button
              type="button"
              onClick={clearPin}
              title="إزالة الدبوس"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "none",
                background: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ef4444",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        {/* Hint overlay — only before pin is placed */}
        {!hasPin && (
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 12,
              padding: "5px 14px",
              borderRadius: 99,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            انقر على الخريطة لتحديد الموقع
          </div>
        )}
      </div>

      {/* Address result */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: hasPin ? "#f0f5ff" : "#f9fafb",
          border: `1px solid ${hasPin ? "#c7d9f9" : "#e5e7eb"}`,
          borderRadius: 8,
          minHeight: 38,
          transition: "all 0.2s",
        }}
      >
        <MapPin
          style={{
            width: 15,
            height: 15,
            color: hasPin ? "#1a56db" : "#9ca3af",
            flexShrink: 0,
          }}
        />
        {isGeocoding ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
            <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
            جاري تحديد العنوان...
          </span>
        ) : address ? (
          <span style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.4 }}>{address}</span>
        ) : (
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            سيظهر العنوان هنا بعد تحديد الموقع
          </span>
        )}
      </div>

      <style>{`
        .mapboxgl-ctrl-bottom-left { bottom: 10px !important; left: 10px !important; }
        .mapboxgl-ctrl-group { border-radius: 8px !important; overflow: hidden; }
      `}</style>
    </div>
  );
}
