import { PrismaClient, ProductType } from "../lib/prisma.js";

export const PRODUCTS = [
  {
    slug: "rx420-rdp",
    name: "NComputing RX420 (RDP)",
    type: ProductType.HARDWARE,
    amount: 10900,
    currency: "INR",
    tagline: "An affordable, energy-saving RDP thin client",
    summary:
      "Built on the Raspberry Pi 4B platform, the RX420(RDP) delivers a rich, PC-like desktop experience for Microsoft AVD, RDS and VDI deployments — a small footprint, low-power endpoint for classrooms and offices that don't need a full desktop PC at every seat.",
    highlights: [
      "Native dual display with full-motion HD video playback",
      "Optimised for Microsoft AVD, RDS, VERDE VDI and vSpace Pro Enterprise",
      "Built-in dual-band Wi-Fi and transparent USB redirection",
      "Integrated Chromium browser for web-kiosk use without virtualization",
    ],
    specifications: {
      Processor: "Broadcom BCM2711, Cortex-A72 quad-core, 1.5 GHz",
      Memory: "2 GB",
      Ports: "2x USB 3.0, 2x USB 2.0, HDMI",
      Connectivity: "Dual-band 2.4/5 GHz Wi-Fi, Gigabit Ethernet",
      "Supported platforms":
        "Microsoft AVD, RDS, VERDE VDI, vSpace Pro Enterprise",
    },
    platforms: ["Microsoft AVD", "RDS", "VERDE VDI", "vSpace Pro Enterprise"],
    isActive: true,
  },
  {
    slug: "rx540-rx580",
    name: "NComputing RX540 / RX580",
    type: ProductType.HARDWARE,
    amount: 19900,
    currency: "INR",
    tagline: "Next-generation endpoint for demanding hybrid workspaces",
    summary:
      "Powered by the Raspberry Pi Compute Module 5, the RX540 (and its 8 GB RX580 variant) is NComputing's fastest thin client yet — dual 4K displays, a major leap in CPU performance over the previous generation, and support for every major virtualization platform in one industrial-grade box.",
    highlights: [
      "Dual 4K (3840x2160 @30Hz) monitor support over HDMI",
      "Quad-core ARM Cortex-A76 — a major leap over the previous RX generation",
      "Works with Citrix, Omnissa Horizon, Microsoft AVD, Windows 365 and RDP",
      "Kensington lock slot and VESA mount for secure, tidy deployments",
    ],
    specifications: {
      Processor: "Broadcom BCM2712, Cortex-A76 quad-core, 2.4 GHz",
      Memory: "4 GB (RX540) or 8 GB (RX580, special order)",
      Storage: "16 GB eMMC",
      Ports: "2x USB 3.0, 2x USB 2.0, dual HDMI",
      Connectivity: "Dual-band 2.4/5 GHz Wi-Fi, Gigabit Ethernet",
      "Supported platforms":
        "Citrix, Omnissa Horizon, Microsoft AVD, Windows 365, RDP",
    },
    platforms: [
      "Citrix",
      "Omnissa Horizon",
      "Microsoft AVD",
      "Windows 365",
      "RDP",
    ],
    isActive: true,
  },
  {
    slug: "vspace-pro-client",
    name: "vSpace Pro Client",
    type: ProductType.SOFTWARE,
    amount: 1499,
    currency: "INR",
    tagline: "Bring a modern virtual desktop to the PCs you already own",
    summary:
      "vSpace Pro Client turns any existing Windows PC into an access point for a centrally managed virtual desktop — no new hardware required. It's the fastest way to extend a vSpace Pro deployment to BYOD laptops, ageing lab computers or a work-from-home setup.",
    highlights: [
      "Runs on Windows 7 SP1, 8.1 and 10 — no hardware upgrade needed",
      "Connects to your vSpace Pro Server over LAN or Wi-Fi",
      "Extends the life of computers too old to run a current OS on their own",
      "Centrally managed, so IT can push updates without visiting every desk",
    ],
    specifications: {
      Requires: "A vSpace Pro Server licence",
      "OS compatibility": "Windows 7 SP1 (32/64-bit), Windows 8.1, Windows 10",
      "Minimum hardware": "Intel Pentium 4, 2 GB RAM",
      Connectivity: "LAN or Wi-Fi",
      Licensing: "Per seat, billed with your vSpace Pro Server plan",
    },
    platforms: ["vSpace Pro Server"],
    isActive: true,
  },
];

export async function seedProducts(prisma: PrismaClient) {
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`Seeded product ${product.slug}`);
  }
}
