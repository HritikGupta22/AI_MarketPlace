import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Books", slug: "books" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Toys & Games", slug: "toys-games" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
  { name: "Automotive", slug: "automotive" },
  { name: "Food & Grocery", slug: "food-grocery" },
  { name: "Art & Crafts", slug: "art-crafts" },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
