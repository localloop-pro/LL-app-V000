"use client";

import { useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Merchant } from "./types";

interface MerchantDetailPanelProps {
  merchant: Merchant | null;
  onClose?: () => void;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function MerchantDetailPanel({
  merchant,
  onClose,
}: MerchantDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "history">(
    "overview"
  );

  if (!merchant) {
    return null;
  }

  const activeTicket = merchant.tickets.find((t) => t.status === "open");

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col shrink-0 z-10 shadow-xl lg:shadow-none absolute inset-y-0 right-0 lg:static transform transition-transform duration-300 h-full">
      {/* Header */}
      <div className="p-5 border-b border-border flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-foreground">{merchant.name}</h2>
          <Badge
            className={cn(
              "inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
              merchant.status === "live" &&
                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
              merchant.status === "pending" &&
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
              merchant.status === "suspended" &&
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {merchant.status === "live"
              ? "Active Merchant"
              : merchant.status === "pending"
              ? "Pending Merchant"
              : "Suspended Merchant"}
          </Badge>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "overview"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "deals"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("deals")}
        >
          Deals
        </button>
        <button
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors",
            activeTab === "history"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="p-5 flex flex-col gap-6">
            {/* Map Preview */}
            <div className="rounded-lg overflow-hidden h-32 relative group cursor-pointer">
              {mapboxToken ? (
                <Map
                  mapboxAccessToken={mapboxToken}
                  initialViewState={{
                    longitude: merchant.coordinates[0],
                    latitude: merchant.coordinates[1],
                    zoom: 15,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  interactive={false}
                >
                  <Marker
                    longitude={merchant.coordinates[0]}
                    latitude={merchant.coordinates[1]}
                    anchor="center"
                  >
                    <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                  </Marker>
                </Map>
              ) : (
                <div className="absolute inset-0 bg-muted"></div>
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-2 left-2 bg-card/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-medium text-foreground flex items-center gap-1 backdrop-blur-sm shadow-sm">
                <span className="material-symbols-outlined text-[14px]">
                  location_on
                </span>
                {merchant.address}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <p className="text-lg font-semibold text-foreground">
                  ${merchant.totalSales.toLocaleString()}
                </p>
              </Card>
              <Card className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-lg font-semibold text-foreground flex items-center gap-1">
                  {merchant.rating > 0 ? merchant.rating : "N/A"}{" "}
                  {merchant.rating > 0 && (
                    <span className="material-symbols-outlined text-amber-400 text-sm">
                      star
                    </span>
                  )}
                </p>
              </Card>
            </div>

            {/* Active Ticket */}
            {activeTicket && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-foreground">
                    Active Ticket
                  </h3>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab("history");
                    }}
                  >
                    View all
                  </a>
                </div>
                <Card className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400">
                      #{activeTicket.id} - {activeTicket.title}
                    </span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 opacity-70">
                      {activeTicket.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {activeTicket.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 py-1.5 bg-card dark:bg-red-900/20 border-red-200 dark:border-red-800 text-xs font-medium text-red-700 dark:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      Reply
                    </Button>
                    <Button className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded shadow-sm">
                      Resolve
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Management Actions */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-foreground">Management</h3>
              <button className="flex items-center gap-3 w-full p-2 text-left rounded hover:bg-accent text-sm text-foreground transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  edit
                </span>
                Edit Merchant Details
              </button>
              <button className="flex items-center gap-3 w-full p-2 text-left rounded hover:bg-accent text-sm text-foreground transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  lock_reset
                </span>
                Reset Password
              </button>
              <button className="flex items-center gap-3 w-full p-2 text-left rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  block
                </span>
                Suspend Account
              </button>
            </div>
          </div>
        )}

        {activeTab === "deals" && (
          <div className="p-5">
            <p className="text-sm text-muted-foreground">
              Deals tab content coming soon...
            </p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="p-5">
            <p className="text-sm text-muted-foreground">
              History tab content coming soon...
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/50">
        <Button className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          Simulate Login
        </Button>
      </div>
    </aside>
  );
}

