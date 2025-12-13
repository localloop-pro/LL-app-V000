import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { geoLocation } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import type { GeoLocation } from "@/app/dashboard/super-admin/components/types";

export async function GET() {
  try {
    await requireAdmin();

    // Fetch all geo locations
    const locations = await db.select().from(geoLocation);

    // Build hierarchy tree
    const buildTree = (parentId: string | null = null): GeoLocation[] => {
      const filtered = locations.filter((loc) => {
        if (parentId === null) {
          return loc.parentId === null;
        }
        return loc.parentId === parentId;
      });
      
      return filtered.map((loc): GeoLocation => ({
        id: loc.id,
        name: loc.name,
        type: loc.type as "country" | "state" | "city" | "postcode",
        coordinates:
          loc.latitude && loc.longitude
            ? ([loc.longitude, loc.latitude] as [number, number])
            : undefined,
        children: buildTree(loc.id),
      }));
    };

    const tree = buildTree();

    return NextResponse.json(tree);
  } catch (error) {
    console.error("Error fetching geo locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch geo locations" },
      { status: 500 }
    );
  }
}

