"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Map, Loader2 } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import type mapboxgl from "mapbox-gl";
import { ListingResource } from '../api/models/ListingResource';
import MapListCard from "./map/map-list-card";
import { useIsMobile } from "@/hooks/use-mobile";

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
  locale: string;
  isLoading?: boolean;
  onBoundsChange: (bounds: BoundsFilter) => void;
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


// ─── Main Component ───────────────────────────────────────────────────────────
export default function MapSearchView({
  properties,
  isLoading,
  onBoundsChange,
  locale,
}: MapSearchViewProps) {
  const isMobile = useIsMobile();
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSearchHere, setShowSearchHere] = useState(false);
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [SearchBox, setSearchBox] = useState<any>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pendingBoundsRef = useRef<BoundsFilter | null>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [mapboxModule, searchModule] = await Promise.all([
        import("mapbox-gl"),
        import("@mapbox/search-js-react"),
      ]);

      if (cancelled) return;

      const mapbox = (mapboxModule as any).default ?? mapboxModule;
      if (MAPBOX_ACCESS_TOKEN) {
        mapbox.accessToken = MAPBOX_ACCESS_TOKEN;
      }

      setMapboxgl(mapbox);
      setSearchBox(() => (searchModule as any).SearchBox);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

      
      </div>


      {/* ── Map mode ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flex: 1,
          overflow: "hidden",
          height: isMobile ? "auto" : "calc(100vh - 196px)",
        }}
      >
        {/* Map panel */}
        <div
          style={{
            flex: 1,
            position: "relative",
            minHeight: isMobile ? "50vh" : undefined,
            order: isMobile ? 1 : 2,
          }}
        >

          {/* ── Mapbox SearchBox — floats over the map ── */}
          {isMounted && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: isMobile ? "calc(100% - 24px)" : 280,
                maxWidth: 360,
              }}
            >
              {SearchBox && mapboxgl ? (
                <SearchBox
                  accessToken={MAPBOX_ACCESS_TOKEN}
                  map={mapRef.current ?? undefined}
                  mapboxgl={mapboxgl}
                  onRetrieve={(result: any) => {
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
              ) : null}
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

          {mapboxgl ? (
            <MapboxMapInner
              properties={properties}
              mapRef={mapRef}
              mapboxgl={mapboxgl}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onMarkerClick={handleMarkerClick}
              onBoundsChange={handleBoundsChange}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-zinc-400">تحميل الخريطة...</p>
              </div>
            </div>
          )}
        </div>

          {/* Scrollable list sidebar */}
        <div
          ref={listRef}
          style={{
            width: isMobile ? "100%" : 320,
            maxHeight: isMobile ? "45vh" : "none",
            flexShrink: 0,
            overflowY: "auto",
            borderLeft: isMobile ? "none" : "1px solid #e5e7eb",
            borderTop: isMobile ? "1px solid #e5e7eb" : "none",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            order: isMobile ? 2 : 1,
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
                  locale={locale}
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
      

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      </div>
    </div>
  );
}
