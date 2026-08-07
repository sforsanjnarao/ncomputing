/**
 * Long-form marketing narrative for each product's "Why this one?" page.
 *
 * This is prose, not data: it is never queried, filtered or sorted, and it
 * changes when someone rewrites a sentence rather than when someone places an
 * order. Keeping it in the repo means edits go through review like any other
 * change, instead of needing a CMS this project does not warrant.
 */

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
  "rx420-vspace": {
    slug: "rx420-vspace",
    audience: "Schools, colleges and coaching institutes running a shared computer lab",
    problemTitle: "A 30-seat lab costs you thirty PCs — and thirty of everything that goes wrong.",
    problemBody:
      "A computer lab is not really one purchase. It is thirty purchases, thirty warranties, thirty Windows updates, thirty hard disks waiting to fail, and thirty machines drawing power in a room that then needs cooling. Four years later every one of them is slow at the same time, and the whole bill arrives again.",
    symptoms: [
      {
        title: "The lab is half working",
        body: "Six machines are down, so forty students share twenty-four seats and the timetable quietly breaks.",
      },
      {
        title: "Updates eat a whole Saturday",
        body: "Installing one piece of software means walking to every desk and doing it again, thirty times.",
      },
      {
        title: "The electricity bill grew with the lab",
        body: "Thirty PCs at roughly 110 watts each, plus the fans and air conditioning needed to remove that heat.",
      },
      {
        title: "Everything expires together",
        body: "You bought them in one purchase order, so they become obsolete in one purchase order too.",
      },
    ],
    solutionTitle: "Buy the computing power once. Share it fifteen ways.",
    solutionBody:
      "One reasonably specified host PC has far more power than any single person uses. vSpace Pro splits that host into independent Windows desktops, and each RX420 turns one of them into two real seats — two monitors, two keyboards, two mice, two students working on completely separate things. A 30-seat lab becomes three host PCs and fifteen small boxes instead of thirty desktops.",
    steps: [
      {
        title: "Install vSpace Pro on the host",
        body: "One Windows PC or server in the corner of the room, or in the server cupboard.",
      },
      {
        title: "Plug in the RX420s",
        body: "Network cable, two monitors, two keyboards, two mice. No operating system to install at the desk.",
      },
      {
        title: "Everyone logs in",
        body: "Each user gets their own desktop, their own files and their own settings, all from the one host.",
      },
      {
        title: "You maintain one machine",
        body: "Install software once on the host and every seat has it. Nothing is stored on the devices themselves.",
      },
    ],
    bestFor: [
      "Computer labs of 10 seats and above",
      "Rooms where desk space and power sockets are tight",
      "Institutions that want to add seats a few at a time",
      "Places where nobody on site is a full-time IT administrator",
    ],
    notFor:
      "If your users run heavy video editing, CAD or 3D work all day, a shared host is the wrong tool — those workloads want a dedicated machine.",
  },

  "rx300-plus": {
    slug: "rx300-plus",
    audience: "Small offices and front-desk teams adding a handful of seats at a time",
    problemTitle: "You need three more computers, not thirty.",
    problemBody:
      "Growth rarely arrives in neat batches. You hire two people, a counter gets busy, a back-office desk appears. Buying a full PC each time is expensive, and each one becomes another machine somebody has to patch, back up and eventually replace.",
    symptoms: [
      {
        title: "Every new hire costs ₹40,000 before they start",
        body: "A PC, a Windows licence, and an afternoon of setup, repeated each time.",
      },
      {
        title: "No two machines are the same",
        body: "Bought at different times, so different specs, different Windows versions, different problems.",
      },
      {
        title: "Nobody owns the backups",
        body: "Work sits on whichever desktop the person happened to be using that day.",
      },
    ],
    solutionTitle: "Add a seat for the price of a good monitor.",
    solutionBody:
      "The RX300+ is the plainest thing we make: one small device, one user, no local storage, nothing to configure. It draws its desktop from the same vSpace Pro host as everyone else, so a new seat is a device and a login rather than a whole new computer to look after.",
    steps: [
      { title: "You already have a host", body: "Any reasonably specified office PC running vSpace Pro." },
      { title: "Add the device", body: "Plug it into the network and the monitor. That is the installation." },
      { title: "Create the login", body: "The new person signs in and their desktop is there, already patched." },
      { title: "Files live centrally", body: "Nothing is stored on the device, so nothing is lost if it fails." },
    ],
    bestFor: [
      "Adding two to ten seats without buying a server room",
      "Billing counters, reception desks and data-entry rows",
      "Anywhere a PC would be overkill for the actual work",
      "Replacing ageing PCs one desk at a time",
    ],
    notFor:
      "If you need two people working at one device, the RX420 does that for less than two RX300+ units.",
  },

  "rx-rdp-plus": {
    slug: "rx-rdp-plus",
    audience: "Businesses whose desktops already run in Microsoft Azure",
    problemTitle: "Your desktops moved to the cloud. The hardware on the desk did not.",
    problemBody:
      "If you have moved to Azure Virtual Desktop or Windows 365, the actual computing already happens in a Microsoft data centre. The full-powered PC on each desk is now an expensive way to open a browser — but it still needs patching, still fails, and still gets stolen with company data on its disk.",
    symptoms: [
      {
        title: "You are paying twice",
        body: "A monthly cloud desktop subscription and a ₹40,000 PC whose processor sits idle.",
      },
      {
        title: "Local disks are a liability",
        body: "Every laptop and desktop is a copy of your data walking around the building.",
      },
      {
        title: "Onboarding still takes a day",
        body: "The cloud desktop is instant; imaging the machine in front of it is not.",
      },
    ],
    solutionTitle: "Keep the cloud desktop. Replace the box under the desk.",
    solutionBody:
      "The RX-RDP+ connects directly to Microsoft AVD, Windows 365 and RDS. There is no host server to buy and nothing stored locally — if the device is lost, nothing goes with it. New starters get a device from the cupboard and sign in.",
    steps: [
      { title: "Point it at your tenant", body: "Configure the AVD or Windows 365 endpoint once, centrally." },
      { title: "Hand it to the user", body: "They sign in with the Microsoft account they already have." },
      { title: "Manage it remotely", body: "PMC endpoint manager handles updates and settings across every device." },
      { title: "Replace in minutes", body: "A failed unit is swapped for a spare; the desktop is untouched." },
    ],
    bestFor: [
      "Companies already on Azure Virtual Desktop or Windows 365",
      "Regulated offices that cannot have data on local disks",
      "Branch offices with no IT staff on site",
      "Teams that want no server hardware at all",
    ],
    notFor:
      "If you do not have cloud desktops and do not plan to, the vSpace products are cheaper — you would be paying Microsoft monthly for something a host PC does once.",
  },
};
