"use client";

import { useEffect, useRef, useCallback, RefObject } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type {  BoundsFilter } from "./map-search";
import { ListingResource } from "@/api";

const ALGERIA_CENTER: [number, number] = [3.0, 36.5];
const DEFAULT_ZOOM = 5.5;

const DEMO_COORDS: [number, number][] = [
  [3.0865, 36.7372],
  [5.0868, 36.752],
  [-0.63, 35.69],
  [6.61, 36.36],
  [2.83, 36.46],
  [6.17, 35.55],
  [5.73, 35.38],
  [1.66, 35.34],
];

function getFakeCoords(
  property: ListingResource,
  index: number
): [number, number] {
  if (property.location?.longitude && property.location?.latitude) return [Number(property.location.longitude) || 0, Number(property.location.latitude) || 0];
  return DEMO_COORDS[index % DEMO_COORDS.length];
}

function formatPrice(price: number) {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M د.ج`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K د.ج`;
  return `${price} د.ج`;
}

// ─── Rich Popup Card ────────────────────────────────────────────────────────
function PopupCard({ property }: { property: ListingResource }) {
  const img = property.image ? `${property.image}` : null;

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "'Cairo', sans-serif",
        width: 240,
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 130, background: "#f3f4f6" }}>
        {img ? (
          <img
            src={img}
            alt={property.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🏠
          </div>
        )}
        {/* Price badge */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "#1a56db",
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 99,
            boxShadow: "0 2px 8px rgba(26,86,219,0.4)",
          }}
        >
          {formatPrice(property.price)}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px 12px" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 13,
            fontWeight: 700,
            color: "#111",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {property.title}
        </p>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          {(property?.surface || 0) > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>📐</span> {(property.surface || 0).toFixed(2)} م²
            </span>
          )}
          {(property as any).bhk > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span>🛏</span> {(property as any).bhk} غرف
            </span>
          )}
          {/* {property.verified && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#059669" }}>
              <span>✓</span> موثّق
            </span>
          )} */}
        </div>

        {/* CTA */}
        <a
          href={`/listings/${property.id}`}
          style={{
            display: "block",
            textAlign: "center",
            background: "#1a56db",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            padding: "7px 0",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          عرض التفاصيل ←
        </a>
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface MapboxMapInnerProps {
  properties: ListingResource[];
  hoveredId: string | number | null;
  mapboxgl: any;
  selectedId: string | number | null;
  mapRef: RefObject<any | null>;
  onMarkerClick: (id: string | number) => void;
  onBoundsChange: (bounds: BoundsFilter) => void;
}

export default function MapboxMapInner({
  properties,
  hoveredId,
  selectedId,
  mapRef,
  onMarkerClick,
  mapboxgl,
  onBoundsChange,
}: MapboxMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<
    Map<string | number, { marker: any; el: HTMLElement }>
  >(new Map());
  const popupRef = useRef<any | null>(null);
  const popupRootRef = useRef<{ unmount: () => void } | null>(null);
  const boundsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fixed fireBounds ──────────────────────────────────────────────────────
  const fireBounds = useCallback(
    (map: any) => {
      // always clear first, then schedule — this was the bug
      if (boundsTimer.current) clearTimeout(boundsTimer.current);
      boundsTimer.current = setTimeout(() => {
        const b = map.getBounds();
        if (!b) return;
        onBoundsChange({
          swLat: b.getSouth(),
          swLng: b.getWest(),
          neLat: b.getNorth(),
          neLng: b.getEast(),
        });
        boundsTimer.current = null;
      }, 600);
    },
    [onBoundsChange]
  );

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // Streets gives more geographic context (city names, roads, neighborhoods)
      style: "mapbox://styles/mapbox/streets-v12",
      center: ALGERIA_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      // smoother experience
      cooperativeGestures: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-left"
    );
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    // Close popup on map click (not on a marker)
    map.on("click", () => {
      popupRef.current?.remove();
      popupRef.current = null;
    });

    map.on("moveend", () => fireBounds(map));
    map.on("zoomend", () => fireBounds(map));

    mapRef.current = map;

    return () => {
      boundsTimer.current && clearTimeout(boundsTimer.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Sync markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Cleanup old markers + popup
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();
    popupRef.current?.remove();
    popupRef.current = null;

    properties.forEach((property, index) => {
      const coords = getFakeCoords(property, index);
      const isSelected = selectedId === property.id;

      // ── Price pill marker ────────────────────────────────────────────────
      const el = document.createElement("div");
      el.style.cssText = `
        background: ${isSelected ? "#1a56db" : "#ffffff"};
        color: ${isSelected ? "#ffffff" : "#111827"};
        border: 2px solid ${isSelected ? "#1a56db" : "#d1d5db"};
        border-radius: 9999px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.14);
        cursor: pointer;
        font-family: 'Cairo', sans-serif;
        user-select: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        position: relative;
        z-index: ${isSelected ? 10 : 1};
      `;
      el.textContent = formatPrice(property.price);
      el.classList.add("w-16");
      // ── Click → open React popup ─────────────────────────────────────────
      el.addEventListener("click", async (e) => {
        e.stopPropagation();
        onMarkerClick(property.id);

        // Unmount old popup root
        popupRef.current?.remove();
        popupRootRef.current = null;

        // Container for React root
        const container = document.createElement("div");

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: [0, -6],
          maxWidth: "260px",
          className: "menzili-popup",
          anchor: "bottom",
        })
          .setLngLat(coords)
          .setDOMContent(container)
          .addTo(map);

        // Mount React card into popup DOM
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(container);
        root.render(<PopupCard property={property} />);
        popupRootRef.current = root;

        popup.on("close", () => {
          // Defer unmount so Mapbox finishes its cleanup first
          setTimeout(() => root.unmount(), 0);
        });

        popupRef.current = popup;
      });
      const pinMarker = new mapboxgl.Marker({ color: "#2563eb" })
            .setLngLat(coords)
            .addTo(map);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
        // Prevent marker from being dragged into corners
        draggable: false,
      })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current.set(property.id, { marker, el });
    });

    // Fit all markers in view
    if (properties.length > 1) {
      const coords = properties.map((p, i) => getFakeCoords(p, i));
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 900 });
    } else if (properties.length === 1) {
      map.flyTo({
        center: getFakeCoords(properties[0], 0),
        zoom: 13,
        duration: 800,
      });
    }
  }, [properties, selectedId]);

  // ── Highlight hovered marker ──────────────────────────────────────────────
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      const isSelected = id === selectedId;
      const isHovered = id === hoveredId;

      el.style.background = isSelected
        ? "#1a56db"
        : isHovered
        ? "#dbeafe"
        : "#ffffff";
      el.style.color = isSelected ? "#ffffff" : "#111827";
      el.style.borderColor =
        isSelected || isHovered ? "#1a56db" : "#d1d5db";
      el.style.boxShadow =
        isSelected || isHovered
          ? "0 4px 16px rgba(26,86,219,0.35)"
          : "0 2px 8px rgba(0,0,0,0.14)";
      el.style.transform =
        isHovered && !isSelected ? "scale(1.1)" : "scale(1)";
      el.style.zIndex = isSelected ? "20" : isHovered ? "15" : "1";
    });
  }, [hoveredId, selectedId]);

  // ── Fly to selected ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const entry = markersRef.current.get(selectedId);
    if (entry) {
      mapRef.current.easeTo({
        center: entry.marker.getLngLat(),
        zoom: Math.max(mapRef.current.getZoom(), 12),
        duration: 500,
        offset: [0, -60], // offset upward so popup isn't clipped
      });
    }
  }, [selectedId]);

  return (
    <>
      <style>{`
        /* Popup wrapper */
        .menzili-popup .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 14px !important;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18) !important;
          border: 1px solid #e5e7eb;
        }
        /* Hide default tip background bleed */
        .menzili-popup .mapboxgl-popup-tip {
          border-top-color: #fff !important;
        }
        /* Close button */
        .menzili-popup .mapboxgl-popup-close-button {
          top: 6px;
          right: 6px;
          font-size: 16px;
          color: #fff;
          background: rgba(0,0,0,0.35);
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          padding: 0;
          z-index: 2;
        }
        .menzili-popup .mapboxgl-popup-close-button:hover {
          background: rgba(0,0,0,0.55);
        }
        /* Nav controls position */
        .mapboxgl-ctrl-bottom-left {
          bottom: 20px !important;
          left: 12px !important;
        }
        .mapboxgl-ctrl-group {
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", minHeight: 500 }}
      />
    </>
  );
}
