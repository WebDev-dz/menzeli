"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type WidgetView = "map" | "row-card" | "cards";

type WidgetContextValue = {
  view: WidgetView;
  setView: (view: WidgetView) => void;
  showMap: () => void;
  showRowCard: () => void;
  showCards: () => void;
  isMapView: boolean;
  isRowCardView: boolean;
  isCardsView: boolean;
};

type WidgetProviderProps = {
  children: React.ReactNode;
  defaultView?: WidgetView;
  storageKey?: string;
  persist?: boolean;
};

const DEFAULT_STORAGE_KEY = "widget_view_mode";

const WidgetContext = createContext<WidgetContextValue | null>(null);

export function WidgetProvider({
  children,
  defaultView = "cards",
  storageKey = DEFAULT_STORAGE_KEY,
  persist = true,
}: WidgetProviderProps) {
  const [view, setViewState] = useState<WidgetView>(defaultView);

  useEffect(() => {
    if (!persist || typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey) as WidgetView | null;
    if (saved === "map" || saved === "row-card" || saved === "cards") {
      setViewState(saved);
    }
  }, [persist, storageKey]);

  const setView = (nextView: WidgetView) => {
    setViewState(nextView);
    if (!persist || typeof window === "undefined") return;
    localStorage.setItem(storageKey, nextView);
  };

  const value = useMemo<WidgetContextValue>(
    () => ({
      view,
      setView,
      showMap: () => setView("map"),
      showRowCard: () => setView("row-card"),
      showCards: () => setView("cards"),
      isMapView: view === "map",
      isRowCardView: view === "row-card",
      isCardsView: view === "cards",
    }),
    [view],
  );

  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
}
