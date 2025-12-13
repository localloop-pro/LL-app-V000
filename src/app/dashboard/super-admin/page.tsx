"use client";

import { useState, useMemo, useEffect } from "react";
import { GeoHierarchyTree } from "./components/geo-hierarchy-tree";
import { MerchantDetailPanel } from "./components/merchant-detail-panel";
import { MerchantMap } from "./components/merchant-map";
import { MerchantTable } from "./components/merchant-table";
import { StatsCard } from "./components/stats-card";
import { GeoLocation, Merchant, Stats } from "./components/types";

export default function SuperAdminPage() {
  const [geoHierarchy, setGeoHierarchy] = useState<GeoLocation[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeMerchants: 0,
    pendingApproval: 0,
    openTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(
    null
  );
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );

  // Fetch geo locations on mount
  useEffect(() => {
    async function fetchGeoLocations() {
      try {
        const res = await fetch("/api/super-admin/geo-locations");
        const data = await res.json();
        setGeoHierarchy(data);
        // Set default location
        const defaultLocation =
          data[0]?.children?.[0]?.children?.[0]?.children?.[0];
        if (defaultLocation) {
          setSelectedLocation(defaultLocation);
        }
      } catch (error) {
        console.error("Error fetching geo locations:", error);
      }
    }
    fetchGeoLocations();
  }, []);

  // Fetch merchants and stats when location changes
  useEffect(() => {
    if (!selectedLocation) return;

    async function fetchData() {
      setLoading(true);
      try {
        const locationId = selectedLocation.id;
        const [merchantsRes, statsRes] = await Promise.all([
          fetch(`/api/super-admin/merchants?locationId=${locationId}`),
          fetch(`/api/super-admin/stats?locationId=${locationId}`),
        ]);

        const merchantsData = await merchantsRes.json();
        const statsData = await statsRes.json();

        setMerchants(merchantsData);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedLocation]);

  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!selectedLocation || !geoHierarchy.length) {
      return ["Australia", "NSW", "Sydney", "Bondi 2026"];
    }

    const findPath = (
      nodes: GeoLocation[],
      targetId: string,
      currentPath: string[] = []
    ): string[] | null => {
      for (const node of nodes) {
        const newPath = [...currentPath, node.name];
        if (node.id === targetId) {
          return newPath;
        }
        if (node.children) {
          const found = findPath(node.children, targetId, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    const found = selectedLocation ? findPath(geoHierarchy, selectedLocation.id) : null;
    return found || ["Australia", "NSW", "Sydney", "Bondi 2026"];
  }, [selectedLocation, geoHierarchy]);

  const locationName =
    selectedLocation?.name || "Bondi (2026)";
  const locationDescription =
    selectedLocation?.type === "postcode"
      ? "Manage merchants, deal approvals, and essay content for this region."
      : "Select a location to view merchants.";

  return (
    <>
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center px-6 justify-between shrink-0">
        <nav className="flex items-center gap-2 text-sm overflow-hidden whitespace-nowrap">
          {breadcrumbPath.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted-foreground/60">/</span>
              )}
              {index === breadcrumbPath.length - 1 ? (
                <span className="text-foreground font-semibold bg-muted px-2 py-0.5 rounded text-xs">
                  {item}
                </span>
              ) : (
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  {item}
                </a>
              )}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-4 w-px bg-border"></div>
          <button className="p-2 rounded-full hover:bg-accent text-muted-foreground">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Hierarchy Panel */}
        <GeoHierarchyTree
          data={geoHierarchy}
          selectedId={selectedLocation?.id}
          onSelect={setSelectedLocation}
        />

        {/* Center Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
          {/* Title Section */}
          <div className="px-6 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {locationName}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {locationDescription}
            </p>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-20 bg-muted animate-pulse rounded-lg" />
              <div className="h-20 bg-muted animate-pulse rounded-lg" />
              <div className="h-20 bg-muted animate-pulse rounded-lg" />
            </div>
          ) : (
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                label="Active Merchants"
                value={stats.activeMerchants}
                indicatorColor="emerald"
              />
              <StatsCard
                label="Pending Approval"
                value={stats.pendingApproval}
                indicatorColor="amber"
              />
              <StatsCard
                label="Open Tickets"
                value={stats.openTickets}
                indicatorColor="red"
              />
            </div>
          )}

          {/* Map */}
          <div className="px-6 pb-4">
            <MerchantMap
              merchants={merchants}
              center={
                selectedLocation?.coordinates || [151.2767, -33.8915]
              }
              zoom={selectedLocation?.type === "postcode" ? 14 : 12}
              onMerchantClick={setSelectedMerchant}
            />
          </div>

          {/* Merchant Table */}
          <MerchantTable
            merchants={merchants}
            onMerchantSelect={setSelectedMerchant}
            selectedMerchantId={selectedMerchant?.id}
          />
        </div>

        {/* Detail Panel */}
        <MerchantDetailPanel
          merchant={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
        />
      </main>
    </>
  );
}

