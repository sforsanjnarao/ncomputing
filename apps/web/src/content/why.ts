

export type WhyContent = {
  slug: string;
  audience: string;
  problemTitle: string;
  problemBody: string;
  symptoms: { title: string; body: string }[];
  solutionTitle: string;
  solutionBody: string;
  steps: { title: string; body: string }[];
  bestFor: string[];
  notFor: string;
};

export const WHY_CONTENT: Record<string, WhyContent> = {
  "rx420-rdp": {
    slug: "rx420-rdp",
    audience:
      "IT teams who have already moved desktops to Microsoft AVD, RDS or another cloud/VDI platform",
    problemTitle:
      "Your desktop already lives in the cloud. The box under the desk still doesn't.",
    problemBody:
      "If you're running Microsoft AVD, RDS or a VDI platform, the actual computing already happens somewhere else — a data centre, not the desk. A full Windows PC sitting there is now an expensive, power-hungry way to open a remote session, and it still needs patching, still fails, and still has a hard disk somebody could walk off with.",
    symptoms: [
      {
        title: "You're paying for compute nobody uses",
        body: "A ₹40,000+ desktop PC whose processor sits mostly idle, because the real work happens on the cloud desktop, not the local one.",
      },
      {
        title: "Every PC is a security liability",
        body: "A local disk is a copy of company data walking around the building, or sitting in someone's home.",
      },
      {
        title: "Onboarding takes a day, not a minute",
        body: "The cloud desktop is provisioned in seconds. Imaging and patching the PC in front of it takes the rest of the morning.",
      },
      {
        title: "IT visits every desk to fix anything",
        body: "A full PC means a full operating system, and a full operating system means updates, drivers and the odd reinstall.",
      },
    ],
    solutionTitle: "Keep the cloud desktop. Replace the box that reaches it.",
    solutionBody:
      "The RX420(RDP) is a small, low-power device built to do exactly one job well: get you onto Microsoft AVD, RDS, VERDE VDI or vSpace Pro Enterprise, fast, with nothing stored locally. If a unit is lost, nothing goes with it — there was never any company data on it to begin with.",
    steps: [
      {
        title: "Point it at your platform",
        body: "Configure the AVD, RDS or VDI endpoint once, centrally, before it ever reaches a desk.",
      },
      {
        title: "Hand it to the user",
        body: "They plug in two monitors, sign in, and their existing desktop is exactly where they left it.",
      },
      {
        title: "Manage it remotely",
        body: "Updates and settings roll out to every device from one place — nobody visits a desk to patch it.",
      },
      {
        title: "Swap, don't repair",
        body: "A failed unit is replaced from a spare in minutes. The virtual desktop behind it is untouched.",
      },
    ],
    bestFor: [
      "Organisations already on Microsoft AVD, RDS or VERDE VDI",
      "Regulated offices that cannot have data sitting on local disks",
      "Branch offices with no IT staff on site",
      "Anywhere a full PC would be a very expensive way to open one window",
    ],
    notFor:
      "If you don't yet have desktops running in the cloud or on a vSpace host, this device has nothing to connect to — start with vSpace Pro and the RX540/RX580, or talk to us about which platform fits first.",
  },

  "rx540-rx580": {
    slug: "rx540-rx580",
    audience:
      "IT teams standardising on one endpoint across several virtualization platforms, or replacing ageing thin clients",
    problemTitle:
      "Every platform you support needs its own box on the desk — until now.",
    problemBody:
      "Modern workplaces rarely run just one thing. One team is on Citrix, another on Microsoft AVD, a third still dials into an on-prem RDS server, and someone in finance just got moved to Windows 365. Standardising on hardware used to mean picking a lane. Sticking with an older thin client generation means living with a single lower-resolution monitor while everyone else has moved on to dual 4K.",
    symptoms: [
      {
        title: "Different teams, different boxes",
        body: "Procurement ends up stocking several different thin client models because no single one covered every platform in use.",
      },
      {
        title: "4K is a laptop-only privilege",
        body: "Anyone at a thin client is stuck on a single lower-resolution monitor while the rest of the office works on two 4K screens.",
      },
      {
        title: "Older endpoints are visibly ageing",
        body: "Video calls stutter, multitasking lags, and the five-year-old thin client is the first thing people blame — correctly.",
      },
      {
        title: "Shared spaces need physical security too",
        body: "A device on a reception desk or open-plan pod needs to be bolted down, not just logged out of.",
      },
    ],
    solutionTitle: "One device, every major platform, twice the screen.",
    solutionBody:
      "Built on the Raspberry Pi Compute Module 5, the RX540 (and its 8 GB RX580 sibling) is NComputing's fastest endpoint yet — a genuine generational leap in CPU and graphics performance over the previous RX line. It talks to Citrix, Omnissa Horizon, Microsoft AVD, Windows 365 and plain RDP, so the same box works whichever platform a given team happens to be on.",
    steps: [
      {
        title: "Choose your memory",
        body: "RX540 for standard use, or the 8 GB RX580 for teams pushing more demanding remote sessions.",
      },
      {
        title: "Connect to any platform",
        body: "Citrix, Horizon, AVD, Windows 365 or RDP — configured once, centrally, per device.",
      },
      {
        title: "Give them dual 4K",
        body: "Two 3840x2160 displays over HDMI, at a resolution older RX devices simply cannot drive.",
      },
      {
        title: "Bolt it down",
        body: "A Kensington lock slot and VESA mount kit for reception desks, labs and other shared spaces.",
      },
    ],
    bestFor: [
      "Organisations running more than one virtualization platform",
      "Anyone replacing a previous-generation RX thin client that's showing its age",
      "Dual 4K, multitasking-heavy roles delivered from a virtual desktop",
      "Shared or public-facing desks that need a physically secured endpoint",
    ],
    notFor:
      "If everyone in the building is on plain RDP or AVD and a single monitor is genuinely enough, the RX420(RDP) does the same job for roughly half the price.",
  },

  "vspace-pro-client": {
    slug: "vspace-pro-client",
    audience:
      "IT teams with existing PCs, laptops or a remote/BYOD workforce who don't want to buy new hardware for every seat",
    problemTitle: "Not every seat needs a new box. Some just need a way in.",
    problemBody:
      "A thin client is the right answer when you're setting up a desk from nothing. But plenty of seats aren't that — they're a PC that already exists, a laptop someone brought from home, or a lab machine that's too old to run a current version of Windows but is otherwise perfectly fine. Buying new hardware for those seats is money spent solving a problem you don't actually have.",
    symptoms: [
      {
        title: "Working PCs get thrown away for the wrong reason",
        body: "A machine too old to run the latest Windows still has years of life left as a way to reach a virtual desktop.",
      },
      {
        title: "Remote workers have no approved way in",
        body: "Someone working from home on their own laptop has no company-sanctioned path to the office desktop.",
      },
      {
        title: "New hardware for every seat adds up fast",
        body: "A thin client per desk makes sense at a new site. It's overkill when the desk already has a working computer on it.",
      },
      {
        title: "BYOD policies exist on paper, not in practice",
        body: 'Without a client to install, "bring your own device" just means IT has no idea what\'s actually connecting.',
      },
    ],
    solutionTitle: "Turn the PC that's already there into the way in.",
    solutionBody:
      "vSpace Pro Client is software, not hardware — install it on an existing Windows 7 SP1, 8.1 or 10 machine and it becomes an access point to your centrally managed vSpace Pro desktop, over LAN or Wi-Fi. No new box, no new warranty, no new asset tag. Just a working PC doing one more useful thing.",
    steps: [
      {
        title: "Install on the existing machine",
        body: "Any PC meeting the minimum spec — Pentium 4 class, 2 GB RAM — is good enough.",
      },
      {
        title: "Connect to your vSpace Pro Server",
        body: "Over the office LAN, or Wi-Fi for a laptop working from anywhere.",
      },
      {
        title: "Sign in to the managed desktop",
        body: "The same centrally managed desktop everyone else on vSpace Pro is using.",
      },
      {
        title: "IT manages the desktop, not the PC",
        body: "Updates and policy live on the vSpace Pro Server — the local machine barely matters anymore.",
      },
    ],
    bestFor: [
      "Extending the useful life of PCs too old for a current OS",
      "Remote and work-from-home staff using their own laptop",
      "BYOD policies that need an actual, manageable client",
      "Mixed rollouts, where some seats get new RX hardware and others reuse what's already there",
    ],
    notFor:
      "If you're kitting out a brand-new site with nothing to reuse, an RX-series thin client is simpler and more secure — there's no local operating system on it to patch or worry about.",
  },
};
