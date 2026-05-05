"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { LayoutList, Map, Loader2, RefreshCw } from "lucide-react";
import { API_URL } from "@/lib/api-config";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { SearchBox } from "@mapbox/search-js-react";
import { ListingResource } from '../api/models/ListingResource';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// ─── Types ────────────────────────────────────────────────────────────────────


export interface BoundsFilter {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface MapSearchViewProps {
  properties: ListingResource[];
  isLoading?: boolean;
  onBoundsChange: (bounds: BoundsFilter) => void;
  viewMode: "list" | "map";
  onViewModeChange: (mode: "list" | "map") => void;
  renderCard: (property: ListingResource) => React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number) {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M د.ج`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}K د.ج`;
  return `${price} د.ج`;
}

// ─── Dynamic Mapbox (no SSR) ──────────────────────────────────────────────────
const MapboxMapInner = dynamic(() => import("./map-box-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-zinc-400">تحميل الخريطة...</p>
      </div>
    </div>
  ),
});

// ─── Compact sidebar card ─────────────────────────────────────────────────────
function MapListCard({
  property,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  property: ListingResource;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const img = property.image ? `${API_URL}${property.image}` : null;

  return (
    <div
      data-property-id={property.id}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 14px",
        borderBottom: "1px solid #f3f4f6",
        background: isSelected ? "#eff4ff" : isHovered ? "#f8faff" : "#fff",
        borderRight: `3px solid ${isSelected ? "#1a56db" : "transparent"}`,
        cursor: "pointer",
        transition: "background 0.12s",
        alignItems: "flex-start",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 76,
          height: 64,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        {img ? (
          <img
            src={img}
            alt={property.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "🏠"
        )}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            margin: "0 0 3px",
            fontSize: 13,
            fontWeight: 700,
            color: "#111",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
        >
          {property.title}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 5,
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          {(property?.surface || 0) > 0 && <span>📐 {property.surface} م²</span>}
          {(property as any).bhk > 0 && (
            <span>🛏 {(property as any).bhk} غرف</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 800, color: "#1a56db" }}
          >
            {formatPrice(property.price)}
          </span>
          {/* {property.verified && (
            <span
              style={{
                fontSize: 10,
                color: "#059669",
                background: "#d1fae5",
                padding: "2px 6px",
                borderRadius: 99,
                fontWeight: 600,
              }}
            >
              موثّق ✓
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MapSearchView({
  properties,
  isLoading,
  onBoundsChange,
  viewMode,
  onViewModeChange,
  renderCard,
}: MapSearchViewProps) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSearchHere, setShowSearchHere] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingBoundsRef = useRef<BoundsFilter | null>(null);

  useEffect(() => setIsMounted(true), []);

  const scrollToProperty = useCallback((id: string | number) => {
    const el = listRef.current?.querySelector(`[data-property-id="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const handleMarkerClick = useCallback(
    (id: string | number) => {
      setSelectedId((prev) => (prev === id ? null : id));
      scrollToProperty(id);
    },
    [scrollToProperty]
  );

  // Store bounds but don't fire yet — wait for user to confirm
  const handleBoundsChange = useCallback((bounds: BoundsFilter) => {
    pendingBoundsRef.current = bounds;
    setShowSearchHere(true);
  }, []);

  const commitSearch = () => {
    if (pendingBoundsRef.current) {
      onBoundsChange(pendingBoundsRef.current);
      setShowSearchHere(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* ── Toggle bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2
                style={{ width: 14, height: 14 }}
                className="animate-spin"
              />
              جاري التحميل...
            </span>
          ) : (
            <>
              <span style={{ fontWeight: 700, color: "#111" }}>
                {properties.length}
              </span>{" "}
              نتيجة
            </>
          )}
        </p>

        {/* View toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            background: "#f4f4f5",
            border: "1px solid #e4e4e7",
            borderRadius: 12,
            padding: 3,
          }}
        >
          {(["list", "map"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 9,
                border: "none",
                fontSize: 13,
                fontWeight: viewMode === mode ? 600 : 400,
                color: viewMode === mode ? "#111" : "#6b7280",
                background: viewMode === mode ? "#fff" : "transparent",
                boxShadow:
                  viewMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {mode === "list" ? (
                <>
                  <LayoutList style={{ width: 15, height: 15 }} /> القائمة
                </>
              ) : (
                <>
                  <Map style={{ width: 15, height: 15 }} /> الخريطة
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── List mode ────────────────────────────────────────────────────── */}
      {viewMode === "list" && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 240,
              }}
            >
              <Loader2
                style={{ width: 32, height: 32, color: "#1a56db" }}
                className="animate-spin"
              />
            </div>
          ) : properties.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 240,
                textAlign: "center",
              }}
            >
              <Map style={{ width: 40, height: 40, color: "#d1d5db", marginBottom: 12 }} />
              <p style={{ color: "#9ca3af", fontSize: 15, margin: 0 }}>
                لا توجد نتائج
              </p>
            </div>
          ) : (
            properties.map((p) => (
              <div
                key={p.id}
                data-property-id={p.id}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  borderRadius: 16,
                  outline:
                    hoveredId === p.id || selectedId === p.id
                      ? "2px solid #1a56db"
                      : "none",
                  outlineOffset: 2,
                  transition: "outline 0.1s",
                }}
              >
                {renderCard(p)}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Map mode ─────────────────────────────────────────────────────── */}
      {viewMode === "map" && (
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            height: "calc(100vh - 196px)",
          }}
        >
          {/* Scrollable list sidebar */}
          <div
            ref={listRef}
            style={{
              width: 320,
              flexShrink: 0,
              overflowY: "auto",
              borderLeft: "1px solid #e5e7eb",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #f0f0f0",
                fontSize: 12,
                color: "#9ca3af",
                fontWeight: 500,
                background: "#fafafa",
              }}
            >
              {isLoading
                ? "جاري التحميل..."
                : `${properties.length} عقار في هذه المنطقة`}
            </div>

            {isLoading ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader2
                  style={{ width: 24, height: 24, color: "#1a56db" }}
                  className="animate-spin"
                />
              </div>
            ) : properties.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <Map
                  style={{
                    width: 36,
                    height: 36,
                    color: "#d1d5db",
                    marginBottom: 10,
                  }}
                />
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
                  حرّك الخريطة للبحث في منطقة مختلفة
                </p>
              </div>
            ) : (
              properties.map((p) => (
                <MapListCard
                  key={p.id}
                  property={p}
                  isSelected={selectedId === p.id}
                  isHovered={hoveredId === p.id}
                  onClick={() => handleMarkerClick(p.id)}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              ))
            )}
          </div>

          {/* Map panel */}
          <div style={{ flex: 1, position: "relative" }}>

            {/* ── Mapbox SearchBox — floats over the map ── */}
            {isMounted && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 10,
                  width: 280,
                }}
              >
                <SearchBox
                  accessToken={MAPBOX_ACCESS_TOKEN}
                  map={mapRef.current ?? undefined}
                  mapboxgl={mapboxgl}
                  onRetrieve={(result) => {
                    // flyTo the selected place
                    const [lng, lat] =
                      result.features[0]?.geometry?.coordinates ?? [];
                    if (lng && lat && mapRef.current) {
                      mapRef.current.flyTo({
                        center: [lng, lat],
                        zoom: 13,
                        duration: 800,
                      });
                    }
                  }}
                  options={{
                    language: "ar",
                    country: "DZ",
                  }}
                  theme={{
                    variables: {
                      fontFamily: "'Cairo', sans-serif",
                      borderRadius: "10px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    },
                  }}
                />
              </div>
            )}

            {/* ── "Search this area" button ── */}
            {showSearchHere && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  animation: "fadeUp 0.2s ease",
                }}
              >
             
              </div>
            )}

            <MapboxMapInner
              properties={properties}
              mapRef={mapRef}
              mapboxgl={mapboxgl}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onMarkerClick={handleMarkerClick}
              onBoundsChange={handleBoundsChange}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}