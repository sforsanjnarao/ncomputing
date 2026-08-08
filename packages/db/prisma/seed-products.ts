import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { seedProducts } from "./products-data.js";

// Products only — no admin/demo user creation, so this is safe to run
// against a real database. `seed.ts` (local dev) also creates
// admin@ncomputing.in with a password hardcoded in source, which you do not
// want live anywhere real.
seedProducts(prisma)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
