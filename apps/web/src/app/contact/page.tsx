import type { Metadata } from "next";
import { CalendarCheck, IndianRupee, PhoneCall } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { LeadCta } from "@/components/lead-cta";
import type { LeadType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Talk to sales",
  description:
    "Book a demo, request pricing, or ask a question about NComputing thin clients for your school or business.",
};

// Three different intents, three different levels of commitment — a visitor who
// is not ready to buy should still have somewhere obvious to go.
const PATHS: {
  type: LeadType;
  icon: typeof PhoneCall;
  title: string;
  body: string;
  label: string;
}[] = [
  {
    type: "DEMO",
    icon: CalendarCheck,
    title: "Request a demo",
    body: "See it working before you commit to anything. We can run it on your own network, or show you a setup we have already deployed nearby.",
    label: "Book a demo",
  },
  {
    type: "PRICING",
    icon: IndianRupee,
    title: "Request pricing",
    body: "Tell us how many seats you need and we will send a written quote, including the host machines and licensing, not just the devices.",
    label: "Get a quote",
  },
  {
    type: "SALES",
    icon: PhoneCall,
    title: "Contact sales",
    body: "Not sure what you need, or whether this suits you at all? Describe your situation and we will tell you honestly.",
    label: "Talk to sales",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="hero-gradient border-b border-slate-200">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Get in touch</p>
            <h1 className="heading-1 mt-3">
              Most people talk to us before they buy.
            </h1>
            <p className="lead mt-5">
              A 30-seat lab is a real decision, and it is worth getting the host
              sizing and the Windows licensing right first. Pick whichever of
              these fits where you are.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-3">
          {PATHS.map((path) => (
            <Card key={path.type} className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <path.icon className="h-6 w-6 text-brand-700" />
                <h2 className="mt-4 text-lg font-semibold">{path.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {path.body}
                </p>
                <LeadCta
                  type={path.type}
                  label={path.label}
                  size="md"
                  className="mt-6 w-full"
                />
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
