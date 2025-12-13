"use client";

import { useState, useCallback } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Merchant } from "./types";

interface MerchantMapProps {
  merchants: Merchant[];
  center?: [number, number];
  zoom?: number;
  onMerchantClick?: (merchant: Merchant) => void;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function MerchantMap({
  merchants,
  center = [151.2767, -33.8915], // Bondi Beach default
  zoom = 13,
  onMerchantClick,
}: MerchantMapProps) {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [filters, setFilters] = useState({
    active: true,
    pending: true,
    suspended: true,
  });

  const getStatusColor = (status: Merchant["status"]) => {
    switch (status) {
      case "live":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusIcon = (status: Merchant["status"]) => {
    switch (status) {
      case "live":
        return "restaurant";
      case "pending":
        return "coffee";
      case "suspended":
        return "surfing";
      default:
        return "store";
    }
  };

  const filteredMerchants = merchants.filter((merchant) => {
    if (merchant.status === "live" && filters.active) return true;
    if (merchant.status === "pending" && filters.pending) return true;
    if (merchant.status === "suspended" && filters.suspended) return true;
    return false;
  });

  const handleMarkerClick = useCallback(
    (merchant: Merchant) => {
      setSelectedMerchant(merchant);
      onMerchantClick?.(merchant);
    },
    [onMerchantClick]
  );

  if (!mapboxToken) {
    return (
      <div className="h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-xl border border-border relative overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">
          Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to
          your .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-xl border border-border relative overflow-hidden group shadow-md">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {filteredMerchants.map((merchant) => (
          <Marker
            key={merchant.id}
            longitude={merchant.coordinates[0]}
            latitude={merchant.coordinates[1]}
            anchor="center"
            onClick={() => handleMarkerClick(merchant)}
          >
            <div className="relative group/pin">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-white cursor-pointer",
                  getStatusColor(merchant.status),
                  merchant.status === "live" && "animate-bounce"
                )}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {getStatusIcon(merchant.status)}
                </span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-card p-2 rounded shadow-xl border border-border hidden group-hover/pin:block text-center z-30">
                <p className="text-xs font-bold text-foreground">
                  {merchant.name}
                </p>
                <p
                  className={cn(
                    "text-[10px]",
                    merchant.status === "live" && "text-emerald-600 dark:text-emerald-400",
                    merchant.status === "pending" && "text-amber-600 dark:text-amber-400",
                    merchant.status === "suspended" && "text-red-600 dark:text-red-400"
                  )}
                >
                  {merchant.status === "live"
                    ? "Live"
                    : merchant.status === "pending"
                    ? "Pending"
                    : "Suspended"}
                </p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-card rotate-45 border-b border-r border-border"></div>
              </div>
            </div>
          </Marker>
        ))}

        {selectedMerchant && (
          <Popup
            longitude={selectedMerchant.coordinates[0]}
            latitude={selectedMerchant.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedMerchant(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2">
              <p className="font-semibold text-sm">{selectedMerchant.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedMerchant.address}
              </p>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className="p-2 bg-card rounded-lg shadow-sm border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <span className="material-symbols-outlined text-[20px]">layers</span>
        </button>
        <div className="flex flex-col bg-card rounded-lg shadow-sm border border-border">
          <button className="p-2 border-b border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
            <span className="material-symbols-outlined text-[20px]">
              remove
            </span>
          </button>
        </div>
        <button
          className="p-2 bg-card rounded-lg shadow-sm border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="Select Area"
        >
          <span className="material-symbols-outlined text-[20px]">
            select_all
          </span>
        </button>
      </div>

      {/* Map Filter */}
      <Card className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm z-10 max-w-xs">
        <h3 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">
            map
          </span>
          Map Filter
        </h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.active}
              onChange={(e) =>
                setFilters({ ...filters, active: e.target.checked })
              }
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 dark:bg-slate-800"
            />
            <span>Active Merchants</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-auto"></span>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.pending}
              onChange={(e) =>
                setFilters({ ...filters, pending: e.target.checked })
              }
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 dark:bg-slate-800"
            />
            <span>Pending Approval</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-auto"></span>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.suspended}
              onChange={(e) =>
                setFilters({ ...filters, suspended: e.target.checked })
              }
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 dark:bg-slate-800"
            />
            <span>Suspended</span>
            <span className="w-2 h-2 rounded-full bg-red-500 ml-auto"></span>
          </label>
        </div>
      </Card>

      {/* Cluster indicator */}
      {merchants.length > filteredMerchants.length && (
        <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin z-20">
          <div className="w-8 h-8 bg-slate-800 dark:bg-slate-600 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform">
            +{merchants.length - filteredMerchants.length}
          </div>
        </div>
      )}
    </div>
  );
}

