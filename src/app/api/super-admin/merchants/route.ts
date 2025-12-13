import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { merchant, ticket } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    // Fetch merchants
    let query = db.select().from(merchant);

    if (locationId) {
      query = db
        .select()
        .from(merchant)
        .where(eq(merchant.locationId, locationId)) as typeof query;
    }

    const merchants = await query;

    // Fetch tickets for each merchant
    const merchantsWithTickets = await Promise.all(
      merchants.map(async (m) => {
        const tickets = await db
          .select()
          .from(ticket)
          .where(eq(ticket.merchantId, m.id));

        return {
          id: m.id,
          name: m.name,
          logo: m.logo || "",
          merchantId: m.merchantId,
          status: m.status as "live" | "pending" | "suspended",
          activeDeals: m.activeDeals,
          essayStatus: m.essayStatus as "published" | "drafting" | "none",
          address: m.address,
          coordinates: [m.longitude, m.latitude] as [number, number],
          totalSales: m.totalSales || 0,
          rating: m.rating || 0,
          tickets: tickets.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status as "open" | "resolved" | "pending",
            createdAt: t.createdAt.toISOString(),
            description: t.description,
            type: t.type,
          })),
          supportTickets:
            tickets.length > 0
              ? {
                  count: tickets.filter((t) => t.status === "open").length,
                  ticketId: tickets.find((t) => t.status === "open")?.id,
                  type: tickets.find((t) => t.status === "open")?.type,
                }
              : undefined,
        };
      })
    );

    return NextResponse.json(merchantsWithTickets);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchants" },
      { status: 500 }
    );
  }
}

