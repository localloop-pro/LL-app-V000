import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { merchant, ticket } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    // Build base query
    let merchants;
    if (locationId) {
      merchants = await db
        .select()
        .from(merchant)
        .where(eq(merchant.locationId, locationId));
    } else {
      merchants = await db.select().from(merchant);
    }

    // Calculate stats
    const activeMerchants = merchants.filter((m) => m.status === "live").length;
    const pendingApproval = merchants.filter((m) => m.status === "pending")
      .length;

    // Count open tickets for these merchants
    const merchantIds = merchants.map((m) => m.id);
    const openTicketsCount =
      merchantIds.length > 0
        ? (
            await db
              .select()
              .from(ticket)
              .where(
                and(
                  eq(ticket.status, "open"),
                  inArray(ticket.merchantId, merchantIds)
                )
              )
          ).length
        : 0;

    return NextResponse.json({
      activeMerchants,
      pendingApproval,
      openTickets: openTicketsCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

