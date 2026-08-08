import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma, Role } from "../lib/prisma.js";
import { seedProducts } from "./products-data.js";

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@ncomputing.in" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@ncomputing.in",
      password: await bcrypt.hash("Admin@12345", 10),
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@ncomputing.in" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@ncomputing.in",
      password: await bcrypt.hash("User@12345", 10),
      role: Role.USER,
    },
  });

  console.log("Seeded admin@ncomputing.in / Admin@12345");
  console.log("Seeded user@ncomputing.in / User@12345");

  await seedProducts(prisma);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
