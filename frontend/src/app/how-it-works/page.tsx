import type { Metadata } from "next";
import { Monitor, Network, Server, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { LeadCta } from "@/components/lead-cta";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Desktop virtualisation explained without jargon: one host PC runs many independent desktops, each sent to a small device with its own monitor, keyboard and mouse.",
};

const LAYERS = [
  {
    icon: Server,
    title: "1. One host machine",
    body: "A single reasonably specified PC or server sits in the room or the server cupboard. It has the processor, memory and disk — the parts that are actually expensive.",
  },
  {
    icon: Network,
    title: "2. vSpace Pro divides it up",
    body: "Software on that host creates a separate, isolated Windows desktop for each user. One person cannot see another person's files or affect their session.",
  },
  {
    icon: Monitor,
    title: "3. A small device at each desk",
    body: "Each desktop is sent over the network to a thin client the size of a paperback. It has no disk and nothing to install — it just draws the screen and sends back the keyboard and mouse.",
  },
  {
    icon: Users,
    title: "4. Everybody works normally",
    body: "Each person has their own login, their own documents and their own settings. To them it looks and behaves like their own PC, because functionally it is.",
  },
];

const FAQS = [
  {
    q: "Do users notice they are sharing?",
    a: "For normal work — browsing, office documents, coding lessons, billing software, video lessons — no. Sharing shows up only when several people run something genuinely heavy at the same time, like video rendering.",
  },
  {
    q: "What happens if the host PC fails?",
    a: "Everyone connected to that host stops, which is the honest trade-off. It is why we size hosts for around ten seats each rather than one host for a whole building — a 30-seat lab has three, so a failure takes out a third of the room, not all of it.",
  },
  {
    q: "Do we need an IT person?",
    a: "Not a full-time one. Most of the work disappears because there is one machine to patch instead of thirty. Schools we work with typically have a teacher who handles it alongside their teaching.",
  },
  {
    q: "Can we start small and grow?",
    a: "Yes, and most people do. Start with one host and a few devices, then add devices as budget allows. Once a host is full you add another host, not another thirty PCs.",
  },
  {
    q: "What about Windows licensing?",
    a: "You still need to licence Windows correctly for the number of users. This is the part most people get wrong on their own, so we walk through it with you before you order.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-brand-50">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h1 className="heading-1 mt-3">
              It is simpler than the words &ldquo;desktop virtualisation&rdquo; suggest.
            </h1>
            <p className="lead mt-5">
              One computer does the thinking. Several people use it at once, each with their own
              screen and keyboard. That is the whole idea — everything else is detail.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-2">
            {LAYERS.map((layer) => (
              <div key={layer.title} className="rounded-2xl border border-slate-200 p-6">
                <layer.icon className="h-6 w-6 text-brand-700" />
                <h2 className="mt-4 text-lg font-semibold">{layer.title}</h2>
                <p className="mt-2 leading-relaxed text-slate-600">{layer.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container-page max-w-3xl">
          <h2 className="heading-2">Questions people actually ask</h2>
          <dl className="mt-8 divide-y divide-slate-200">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-5">
                <dt className="font-semibold">{faq.q}</dt>
                <dd className="mt-2 leading-relaxed text-slate-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container-page flex flex-wrap items-center gap-4">
          <ButtonLink href="/products" size="lg">
            See the three products
          </ButtonLink>
          <LeadCta type="DEMO" label="Book a demo" variant="secondary" />
        </div>
      </section>
    </>
  );
}
