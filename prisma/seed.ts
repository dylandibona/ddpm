import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding database...");

  // Create Property 1
  const property1 = await prisma.property.create({
    data: {
      name: "Sunset Apartments",
      address: "123 Main Street, San Francisco, CA 94102",
    },
  });

  console.log(`Created property: ${property1.name} (${property1.id})`);

  // Create Property 2
  const property2 = await prisma.property.create({
    data: {
      name: "Ocean View Condos",
      address: "456 Beach Boulevard, Los Angeles, CA 90210",
    },
  });

  console.log(`Created property: ${property2.name} (${property2.id})`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

