import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    adapter: () => new PrismaPg({ connectionString: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]! }),
  },
});
