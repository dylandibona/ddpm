import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting database reset and seed...");

  // Clear all existing data (in order due to foreign key constraints)
  console.log("Clearing existing data...");
  await prisma.transaction.deleteMany();
  console.log("✓ Deleted all transactions");

  await prisma.statement.deleteMany();
  console.log("✓ Deleted all statements");

  await prisma.property.deleteMany();
  console.log("✓ Deleted all properties");

  // Seed with real properties
  console.log("\nSeeding real properties...");

  const property1 = await prisma.property.create({
    data: {
      name: "3520 18th Street",
      address: "3520 18th Street, San Francisco, CA",
    },
  });
  console.log(`✓ Created: ${property1.address}`);

  const property2 = await prisma.property.create({
    data: {
      name: "4605 South Saratoga St",
      address: "4605 South Saratoga St, New Orleans, LA",
    },
  });
  console.log(`✓ Created: ${property2.address}`);

  const property3 = await prisma.property.create({
    data: {
      name: "4607 South Saratoga St",
      address: "4607 South Saratoga St, New Orleans, LA",
    },
  });
  console.log(`✓ Created: ${property3.address}`);

  console.log("\n✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

