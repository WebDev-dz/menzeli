"use client";

import React, { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocationResource } from "@/api/models/LocationResource";
import { Skeleton } from "@/components/ui/skeletor";

type Props = {
  location?: LocationResource;
  isLoading?: boolean;
  className?: string;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const FALLBACK_CENTER: [number, number] = [3.0588, 36.7538];

const LocationPlace = ({ location, isLoading, className }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const coordinates = useMemo(() => {
    const lat = Number(location?.latitude);
    const lng = Number(location?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    console.log({ location })
    return { lat: 4, lng: 34 };
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    if (!containerRef.current || !coordinates || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [coordinates.lng, coordinates.lat],
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [coordinates]);

  if (isLoading) {
    return <Skeleton className={`h-64 w-full rounded-xl ${className ?? ""}`} />;
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`h-64 w-full rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground ${className ?? ""}`}>
        Map is unavailable: missing `NEXT_PUBLIC_MAPBOX_TOKEN`.
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className={`h-64 w-full rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground ${className ?? ""}`}>
        No valid location coordinates provided.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border ${className ?? ""}`}>
      <div ref={containerRef} className="h-64 w-full" />
      <div className="border-t bg-background px-3 py-2 text-xs text-muted-foreground">
        {location?.city}, {location?.wilaya}, {location?.country}
      </div>
    </div>
  );
};

export default LocationPlace;
