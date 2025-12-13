"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Merchant } from "./types";

interface MerchantTableProps {
  merchants: Merchant[];
  onMerchantSelect?: (merchant: Merchant) => void;
  selectedMerchantId?: string | undefined;
}

export function MerchantTable({
  merchants,
  onMerchantSelect,
  selectedMerchantId,
}: MerchantTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredMerchants = merchants.filter((merchant) => {
    const query = searchQuery.toLowerCase();
    return (
      merchant.name.toLowerCase().includes(query) ||
      merchant.merchantId.toLowerCase().includes(query) ||
      merchant.address.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const paginatedMerchants = filteredMerchants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Merchant["status"]) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Live
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
            Suspended
          </Badge>
        );
    }
  };

  const getEssayStatusBadge = (status: Merchant["essayStatus"]) => {
    switch (status) {
      case "published":
        return (
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
            Published
          </span>
        );
      case "drafting":
        return (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
            Drafting
          </span>
        );
      case "none":
        return (
          <span className="text-xs font-medium text-muted-foreground/50 bg-muted/50 px-2 py-1 rounded">
            None
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="px-6 pb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            search
          </span>
          <Input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-none bg-card ring-1 ring-border focus:ring-2 focus:ring-primary text-sm placeholder:text-muted-foreground shadow-sm"
            placeholder="Search by Name, ID or Postcode..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button variant="outline" className="gap-2">
            <span className="material-symbols-outlined text-[18px]">
              filter_list
            </span>
            Filter
          </Button>
          <div className="h-9 w-px bg-border mx-1 self-center"></div>
          <div className="flex bg-card rounded-lg border border-border p-1 shadow-sm shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="p-1.5 rounded bg-muted text-primary shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px] block">
                grid_view
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="p-1.5 rounded">
              <span className="material-symbols-outlined text-[20px] block">
                list
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <Card className="rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Merchant
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Status
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Active Deals
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Essay Status
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    Support
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedMerchants.map((merchant) => (
                  <tr
                    key={merchant.id}
                    className={cn(
                      "hover:bg-accent/50 transition-colors cursor-pointer group",
                      selectedMerchantId === merchant.id && "bg-primary/5 hover:bg-primary/10"
                    )}
                    onClick={() => onMerchantSelect?.(merchant)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-md bg-muted bg-cover bg-center"
                          style={{ backgroundImage: `url(${merchant.logo})` }}
                          aria-label={`Logo of ${merchant.name}`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {merchant.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {merchant.merchantId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(merchant.status)}</td>
                    <td className="p-4 text-sm text-foreground">
                      {merchant.activeDeals !== null
                        ? `${merchant.activeDeals} Active`
                        : "-"}
                    </td>
                    <td className="p-4">
                      {getEssayStatusBadge(merchant.essayStatus)}
                    </td>
                    <td className="p-4">
                      {merchant.supportTickets ? (
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">
                            {merchant.supportTickets.count}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {merchant.supportTickets.ticketId ||
                              merchant.supportTickets.type}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border p-3 flex items-center justify-between bg-card">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredMerchants.length)}{" "}
              of {filteredMerchants.length} merchants
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="p-1"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="p-1"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

