import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const rupees = (amount: number) => amount * 100;

type SeedOption = {
  group: string;
  label: string;
  description?: string;
  priceDeltaInPaise: number;
  isDefault?: boolean;
};

type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  usersPerDevice: number;
  priceInPaise: number;
  imageEmoji: string;
  sortOrder: number;
  highlights: string[];
  specs: Record<string, string>;
  options: SeedOption[];
};

// Prices are indicative Indian street prices for the assignment; the real
// numbers are quoted by NComputing's channel partners.
const products: SeedProduct[] = [
  {
    slug: "rx420-vspace",
    name: "RX420 (vSpace)",
    tagline: "Two full desktops from one small box.",
    summary:
      "A Raspberry Pi 4 based thin client that runs two independent Windows desktops at once — two monitors, two keyboards, two mice, one device. The lowest cost per seat we ship.",
    usersPerDevice: 2,
    priceInPaise: rupees(28900),
    imageEmoji: "🖥️",
    sortOrder: 1,
    highlights: [
      "2 independent users per device",
      "About 5W per user against roughly 110W for a desktop PC",
      "Dual micro-HDMI at Full HD 1920 × 1200",
      "Runs on the vSpace Pro Enterprise host you already own",
    ],
    specs: {
      Platform: "Raspberry Pi 4 (ARM)",
      "Users per device": "2 concurrent, fully independent",
      Memory: "2 GB",
      Storage: "32 GB microSD",
      Display: "2 × micro-HDMI, up to 1920 × 1200",
      Network: "Gigabit Ethernet, Wi-Fi 802.11ac (2.4/5 GHz)",
      USB: "2 × USB 3.0, 2 × USB 2.0 with transparent redirection",
      Power: "USB-C, ~5W per user",
      "Requires": "vSpace Pro Enterprise on the host PC or server",
      Security: "Kensington lock port",
    },
    options: [
      {
        group: "Support plan",
        label: "1-year AMP (included)",
        description: "Software updates and support for the first year.",
        priceDeltaInPaise: 0,
        isDefault: true,
      },
      { group: "Support plan", label: "3-year AMP", priceDeltaInPaise: rupees(3400) },
      { group: "Support plan", label: "5-year AMP", priceDeltaInPaise: rupees(5200) },
      {
        group: "vSpace Pro licence",
        label: "I already have licences",
        priceDeltaInPaise: 0,
        isDefault: true,
      },
      {
        group: "vSpace Pro licence",
        label: "Add 2 seats",
        description: "One seat per user on this device.",
        priceDeltaInPaise: rupees(4800),
      },
      { group: "Add-ons", label: "No add-ons", priceDeltaInPaise: 0, isDefault: true },
      {
        group: "Add-ons",
        label: "X4Duo dongle kit",
        description: "Extra USB and audio ports for both seats.",
        priceDeltaInPaise: rupees(2600),
      },
    ],
  },
  {
    slug: "rx300-plus",
    name: "RX300+",
    tagline: "The simplest way to add one more seat.",
    summary:
      "The entry-level vSpace Pro thin client. One user per device, nothing to configure, and the cheapest way to grow a lab by a few seats at a time.",
    usersPerDevice: 1,
    priceInPaise: rupees(12500),
    imageEmoji: "📺",
    sortOrder: 2,
    highlights: [
      "Lowest upfront price per device",
      "Centrally managed from the same vSpace console",
      "No moving parts, no local storage to fail",
      "Deploys in minutes with zero end-user training",
    ],
    specs: {
      Platform: "ARM system-on-chip",
      "Users per device": "1",
      Display: "Single display up to 1920 × 1080",
      Network: "Fast Ethernet",
      USB: "USB 2.0 with peripheral redirection",
      Power: "Under 5W typical",
      "Requires": "vSpace Pro Enterprise on the host PC or server",
      Management: "vSpace Console / PMC",
    },
    options: [
      {
        group: "Support plan",
        label: "1-year AMP (included)",
        priceDeltaInPaise: 0,
        isDefault: true,
      },
      { group: "Support plan", label: "3-year AMP", priceDeltaInPaise: rupees(2200) },
      { group: "Support plan", label: "5-year AMP", priceDeltaInPaise: rupees(3600) },
      {
        group: "vSpace Pro licence",
        label: "I already have licences",
        priceDeltaInPaise: 0,
        isDefault: true,
      },
      { group: "vSpace Pro licence", label: "Add 1 seat", priceDeltaInPaise: rupees(2400) },
    ],
  },
  {
    slug: "rx-rdp-plus",
    name: "RX-RDP+",
    tagline: "For desktops that already live in the cloud.",
    summary:
      "An x86 thin client built for Microsoft AVD, Windows 365 and RDS. If your desktops are already hosted in Azure, this replaces the PC on the desk without adding a server on site.",
    usersPerDevice: 1,
    priceInPaise: rupees(18900),
    imageEmoji: "☁️",
    sortOrder: 3,
    highlights: [
      "Connects straight to Microsoft AVD, Windows 365 and RDS",
      "No on-site host server required",
      "Dual display support for billing and back-office desks",
      "Managed remotely through PMC endpoint manager",
    ],
    specs: {
      Platform: "x86-64",
      "Users per device": "1",
      Display: "Dual display support",
      Network: "Gigabit Ethernet, Wi-Fi",
      USB: "USB 3.0 and USB 2.0 with redirection",
      "Works with": "Microsoft AVD, Windows 365, RDS, VERDE VDI",
      Management: "PMC endpoint manager",
    },
    options: [
      {
        group: "Support plan",
        label: "1-year AMP (included)",
        priceDeltaInPaise: 0,
        isDefault: true,
      },
      { group: "Support plan", label: "3-year AMP", priceDeltaInPaise: rupees(2900) },
      { group: "Support plan", label: "5-year AMP", priceDeltaInPaise: rupees(4700) },
      { group: "Mounting", label: "Desk stand (included)", priceDeltaInPaise: 0, isDefault: true },
      { group: "Mounting", label: "VESA mount kit", priceDeltaInPaise: rupees(900) },
    ],
  },
];

async function seedProducts() {
  for (const product of products) {
    const { options, ...data } = product;

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      create: data,
      update: data,
    });

    // Options are replaced wholesale so re-running the seed cannot pile up
    // duplicates. Existing orders are unaffected: they snapshot their own copy.
    await prisma.productOption.deleteMany({ where: { productId: saved.id } });
    await prisma.productOption.createMany({
      data: options.map((option, index) => ({
        ...option,
        productId: saved.id,
        sortOrder: index,
      })),
    });

    console.log(`  product: ${saved.slug}`);
  }
}

async function seedUsers() {
  const accounts = [
    {
      name: "NComputing Admin",
      email: "admin@ncomputing.in",
      password: "Admin@12345",
      role: Role.ADMIN,
      organization: "NComputing India",
    },
    {
      name: "Ravi Sharma",
      email: "ravi@sunrisepublicschool.in",
      password: "Buyer@12345",
      role: Role.USER,
      organization: "Sunrise Public School",
    },
  ];

  for (const account of accounts) {
    const { password, ...rest } = account;
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email: account.email },
      create: { ...rest, password: hashed, phone: "9876543210" },
      update: { ...rest, password: hashed },
    });
    console.log(`  user: ${account.email} (${account.role}) / ${password}`);
  }
}

async function main() {
  console.log("Seeding…");
  await seedProducts();
  await seedUsers();
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
