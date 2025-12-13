"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GeoLocation } from "./types";

interface GeoHierarchyTreeProps {
  data: GeoLocation[];
  selectedId?: string | undefined;
  onSelect?: (location: GeoLocation) => void;
}

export function GeoHierarchyTree({
  data,
  selectedId,
  onSelect,
}: GeoHierarchyTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["australia", "nsw", "sydney"])
  );

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNode = (node: GeoLocation, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const isPostcode = node.type === "postcode";

    return (
      <div key={node.id} className="pl-0">
        <div
          className={cn(
            "flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer transition-colors",
            isSelected
              ? "text-primary bg-primary/10 font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(node.id);
            }
            onSelect?.(node);
          }}
        >
          {hasChildren && (
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? "expand_more" : "chevron_right"}
            </span>
          )}
          {!hasChildren && isPostcode && (
            <span className="material-symbols-outlined text-[16px]">
              location_on
            </span>
          )}
          {!hasChildren && !isPostcode && (
            <span className="material-symbols-outlined text-[16px] opacity-0">
              location_on
            </span>
          )}
          {node.type === "country" && (
            <span className="material-symbols-outlined text-[16px] text-muted-foreground">
              public
            </span>
          )}
          <span>{node.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div
            className={cn(
              "border-l border-border ml-3",
              level === 0 ? "pl-4" : "pl-4",
              level === 1 ? "ml-2" : ""
            )}
          >
            {node.children?.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-slate-50 dark:bg-[#0d141b] border-r border-border flex flex-col shrink-0 hidden lg:flex h-full">
      <div className="p-3 border-b border-border flex justify-between items-center">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Hierarchy
        </span>
        <button className="text-muted-foreground hover:text-primary">
          <span className="material-symbols-outlined text-[18px]">
            filter_list
          </span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-sm">
        {data.map((node) => renderNode(node))}
      </div>
    </div>
  );
}

