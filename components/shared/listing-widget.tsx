"use client";

import React from "react";
import { LayoutGrid, List, Map } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WidgetProvider, WidgetView, useWidget } from "@/components/providers/widget-provider";

type ListingWidgetProps = {
  cardsView: React.ReactNode;
  rowCardsView: React.ReactNode;
  mapView: React.ReactNode;
  defaultView?: WidgetView;
  withProvider?: boolean;
  className?: string;
};

function ListingWidgetContent({
  cardsView,
  rowCardsView,
  mapView,
  className,
}: Omit<ListingWidgetProps, "defaultView" | "withProvider">) {
  const { view, setView } = useWidget();

  return (
    <Tabs
      value={view}
      onValueChange={(nextValue) => setView(nextValue as WidgetView)}
      className={className}
    >
      <TabsList>
        <TabsTrigger value="cards">
          <LayoutGrid className="h-4 w-4" />
          Cards
        </TabsTrigger>
        <TabsTrigger value="row-card">
          <List className="h-4 w-4" />
          List
        </TabsTrigger>
        <TabsTrigger value="map">
          <Map className="h-4 w-4" />
          Map
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cards">{cardsView}</TabsContent>
      <TabsContent value="row-card">{rowCardsView}</TabsContent>
      <TabsContent value="map">{mapView}</TabsContent>
    </Tabs>
  );
}

const ListingWidget = ({
  cardsView,
  rowCardsView,
  mapView,
  defaultView = "row-card",
  withProvider = false,
  className,
}: ListingWidgetProps) => {
  if (withProvider) {
    return (
      <WidgetProvider defaultView={defaultView}>
        <ListingWidgetContent
          cardsView={cardsView}
          rowCardsView={rowCardsView}
          mapView={mapView}
          className={className}
        />
      </WidgetProvider>
    );
  }

  return (
    <ListingWidgetContent
      cardsView={cardsView}
      rowCardsView={rowCardsView}
      mapView={mapView}
      className={className}
    />
  );
};

export default ListingWidget;
