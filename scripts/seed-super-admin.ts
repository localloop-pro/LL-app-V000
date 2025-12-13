/**
 * Seed script for Super Admin Dashboard mock data
 * Run with: npx tsx scripts/seed-super-admin.ts
 */

import { db } from "@/lib/db";
import { geoLocation, merchant, ticket } from "@/lib/db/schema";

async function seed() {
  console.log("🌱 Seeding Super Admin Dashboard data...");

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await db.delete(ticket);
    await db.delete(merchant);
    await db.delete(geoLocation);

    // Seed Geo Locations
    console.log("Seeding geo locations...");
    const australia = await db
      .insert(geoLocation)
      .values({
        id: "australia",
        name: "Australia",
        type: "country",
        parentId: null,
      })
      .returning();

    const nsw = await db
      .insert(geoLocation)
      .values({
        id: "nsw",
        name: "NSW",
        type: "state",
        parentId: australia[0].id,
      })
      .returning();

    await db
      .insert(geoLocation)
      .values({
        id: "victoria",
        name: "Victoria",
        type: "state",
        parentId: australia[0].id,
      });

    const sydney = await db
      .insert(geoLocation)
      .values({
        id: "sydney",
        name: "Sydney",
        type: "city",
        parentId: nsw[0].id,
      })
      .returning();

    const bondi2026 = await db
      .insert(geoLocation)
      .values({
        id: "bondi-2026",
        name: "Bondi (2026)",
        type: "postcode",
        parentId: sydney[0].id,
        latitude: -33.8915,
        longitude: 151.2767,
      })
      .returning();

    await db
      .insert(geoLocation)
      .values({
        id: "bronte-2024",
        name: "Bronte (2024)",
        type: "postcode",
        parentId: sydney[0].id,
        latitude: -33.9067,
        longitude: 151.2633,
      });

    await db
      .insert(geoLocation)
      .values({
        id: "coogee-2034",
        name: "Coogee (2034)",
        type: "postcode",
        parentId: sydney[0].id,
        latitude: -33.9233,
        longitude: 151.2556,
      });

    // Seed Merchants
    console.log("Seeding merchants...");
    const bondiBurger = await db
      .insert(merchant)
      .values({
        id: "bondi-burger",
        name: "Bondi Burger Joint",
        merchantId: "#BND-8821",
        logo:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB1GTUsa6A2pfE_gqVWhjfaL3rl6BupUkYmKfZKGZpUvdwBNEPaWWDeEHohBI-NoN_6UOIT8s03cNDVYAOzP1VCKu8i6lCvcTNLnLHQfBY-S39R5hZKCY5yU5GADZKdDi4tU2ce60qLsbYFiC6enyxv8iiy0J6sk4uvqETtm3lK1Ojsvm3WumV-WAuxlKvbasrPkZezGRrjN4MoEsRD43JAm2V-6Rxsf5HGryegB9l_jfO0tjVeI1sbboumGj2BEU3LeWD-GybzcJs",
        status: "live",
        activeDeals: 3,
        essayStatus: "published",
        address: "80 Campbell Parade, Bondi Beach NSW 2026",
        latitude: -33.8915,
        longitude: 151.2767,
        totalSales: 12450,
        rating: 4.8,
        locationId: bondi2026[0].id,
      })
      .returning();

    await db
      .insert(merchant)
      .values({
        id: "surf-shop",
        name: "Surf Shop Co.",
        merchantId: "#BND-9012",
        logo:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDNkUPwrsjyUiwmzsN3Org9eZZjdPC0Tg0aAYf0EZ57JqqS_hFD2wcRSpO38ajHrzJguSulLRDDLjgdLF3_lI4nv_f9gqis12zuwkM2fU9If5zTeZm37MKoxCvGGxpbcuM9mFUuZo6HpqD-5Jl8phKVC9SGzWmuw9wq1_D4iElhEb92YlPlXBvDsz4nLcl1UcXUmejx9B_UzkNfjudSdZsPpfuIWWLZOi8UzvJ4N3UADJKEJOLP6b7N9L6_wAHNhzFZTN4Mv4DZ_oM",
        status: "suspended",
        activeDeals: 0,
        essayStatus: "none",
        address: "120 Campbell Parade, Bondi Beach NSW 2026",
        latitude: -33.8895,
        longitude: 151.2745,
        totalSales: 0,
        rating: 0,
        locationId: bondi2026[0]!.id,
      });

    await db
      .insert(merchant)
      .values({
        id: "green-cafe",
        name: "The Green Cafe",
        merchantId: "#BND-1142",
        logo:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ4XxHpH7aY9eD6UN0dj4CGfNWEVOL29WgwVklFFoH50OGfUE_xxOU_btJhvtjwp-FKrmMmbIcqfsWxVOgnunEIswpykDn5GoDxQOizuHcN3BUOEZZAVsQlXVcuuXNKRgl-2xTwsfDlKoAcWMgoYY-np7qrndjBGq9kQBYrCsPH39iTJO4frjThmaLh7K66PcmLGsoNJti2ZsELqpdPteDmNmjvVbAIfgrj61LR5xEABWYI7TdtSKoX7xcw1SFMUW1Ytqoj8KHefc",
        status: "pending",
        activeDeals: null,
        essayStatus: "drafting",
        address: "45 Hall Street, Bondi Beach NSW 2026",
        latitude: -33.8933,
        longitude: 151.2789,
        totalSales: 0,
        rating: 0,
        locationId: bondi2026[0]!.id,
      });

    await db
      .insert(merchant)
      .values({
        id: "ocean-view",
        name: "Ocean View Hotel",
        merchantId: "#BND-3391",
        logo:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCbgQFKyi1L9vjboTwLGkuYDV6vL6jDFOdcVZnQoFgviy8VoA4RQNoCljH-P5cxh1FE_lUHS2Gs4-RvOiWDe8hG23BigVPQ3-rSZNO8okyn7LIeFxPVnV0QRnpTU1bSIjixXZu9pHGyVKiWtxn5-LXlYbGselLOK2UWUg4SqJSw49TjiAM66gfpQmm61B-bbsgR4NZiFQ45Rc7Y7BGfoJHN_kkit7wgZXjOv3W-pdwrOE3gA8NsIN3emNVWJLlZFuvB6QfArJHJXEk",
        status: "live",
        activeDeals: 1,
        essayStatus: "published",
        address: "180 Campbell Parade, Bondi Beach NSW 2026",
        latitude: -33.8955,
        longitude: 151.2795,
        totalSales: 8500,
        rating: 4.5,
        locationId: bondi2026[0]!.id,
      });

    // Seed Tickets
    console.log("Seeding tickets...");
    await db.insert(ticket).values({
      id: "ticket-402",
      merchantId: bondiBurger[0]!.id,
      title: "Content Issue",
      description:
        "Merchant is unable to upload the essay for 'Best Burgers in Bondi'. System throws error 505.",
      status: "open",
      type: "Content Issue",
    });

    console.log("✅ Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Geo Locations: 7`);
    console.log(`   - Merchants: 4`);
    console.log(`   - Tickets: 1`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };

