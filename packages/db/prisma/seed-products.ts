import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { seedProducts } from "./products-data.js";

seedProducts(prisma)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
