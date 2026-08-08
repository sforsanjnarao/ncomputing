"use client";

import { useMemo, useState } from "react";
import { formatInr } from "@/lib/format";
import { Card, CardBody } from "@/components/ui/card";
import { LeadDialog } from "@/components/lead-dialog";
import { ASSUMPTIONS } from "@/content/pricing-assumptions";

function electricityCost(watts: number) {
  const kwh =
    (watts / 1000) *
    ASSUMPTIONS.hoursPerDay *
    ASSUMPTIONS.daysPerYear *
    ASSUMPTIONS.years;
  return Math.round(kwh * ASSUMPTIONS.rupeesPerKwh);
}

export function SavingsCalculator() {
  const [seats, setSeats] = useState(30);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const result = useMemo(() => {
    const hosts = Math.ceil(seats / ASSUMPTIONS.seatsPerHost);
    const devices = Math.ceil(seats / ASSUMPTIONS.seatsPerDevice);

    const pcUpfront = seats * ASSUMPTIONS.pcCost;
    const pcPower = electricityCost(seats * ASSUMPTIONS.pcWatts);

    const ncUpfront =
      hosts * ASSUMPTIONS.hostCost + devices * ASSUMPTIONS.devicePrice;
    const ncPower = electricityCost(
      hosts * ASSUMPTIONS.hostWatts + seats * ASSUMPTIONS.deviceWattsPerSeat,
    );

    const pcTotal = pcUpfront + pcPower;
    const ncTotal = ncUpfront + ncPower;
    const saved = pcTotal - ncTotal;

    return {
      hosts,
      devices,
      pcUpfront,
      pcPower,
      pcTotal,
      ncUpfront,
      ncPower,
      ncTotal,
      saved,
      savedPercent: pcTotal === 0 ? 0 : Math.round((saved / pcTotal) * 100),
    };
  }, [seats]);

  return (
    <Card>
      <CardBody className="space-y-6">
        <div>
          <label htmlFor="seats" className="text-sm font-medium text-slate-700">
            How many people need a computer?
          </label>
          <div className="mt-3 flex items-center gap-4">
            <input
              id="seats"
              type="range"
              min={5}
              max={200}
              step={5}
              value={seats}
              onChange={(event) => setSeats(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-700"
            />
            <output className="w-20 shrink-0 text-right text-2xl font-semibold tabular-nums">
              {seats}
            </output>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-500">
              {seats} desktop PCs
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatInr(result.pcTotal)}
            </p>
            <dl className="mt-3 space-y-1 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>Hardware</dt>
                <dd className="tabular-nums">{formatInr(result.pcUpfront)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Electricity, 5 years</dt>
                <dd className="tabular-nums">{formatInr(result.pcPower)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border-2 border-savings-600 bg-savings-50 p-4">
            <p className="text-sm font-medium text-savings-700">
              {result.hosts} host {result.hosts === 1 ? "PC" : "PCs"} +{" "}
              {result.devices} RX420
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-savings-700">
              {formatInr(result.ncTotal)}
            </p>
            <dl className="mt-3 space-y-1 text-sm text-savings-700/80">
              <div className="flex justify-between">
                <dt>Hardware</dt>
                <dd className="tabular-nums">{formatInr(result.ncUpfront)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Electricity, 5 years</dt>
                <dd className="tabular-nums">{formatInr(result.ncPower)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-300">You keep, over five years</p>
            <p className="text-3xl font-semibold tabular-nums">
              {formatInr(result.saved)}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {result.savedPercent}% less than buying {seats} PCs
            </p>
          </div>
          <button
            type="button"
            onClick={() => setQuoteOpen(true)}
            className="h-11 shrink-0 rounded-lg bg-white px-5 text-sm font-medium text-ink hover:bg-slate-100"
          >
            Get this as a written quote
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          Assumes {formatInr(ASSUMPTIONS.pcCost)} per desktop PC,{" "}
          {formatInr(ASSUMPTIONS.hostCost)} per host serving{" "}
          {ASSUMPTIONS.seatsPerHost} seats, {formatInr(ASSUMPTIONS.devicePrice)}{" "}
          per RX420 serving 2 seats, {ASSUMPTIONS.hoursPerDay} hours a day for{" "}
          {ASSUMPTIONS.daysPerYear} days a year at ₹{ASSUMPTIONS.rupeesPerKwh}{" "}
          per unit. Monitors, keyboards and mice cost the same either way and
          are excluded.
        </p>
      </CardBody>

      <LeadDialog
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        type="PRICING"
        defaultSeats={seats}
        title="Get a written quote"
        description={`We'll price a ${seats}-seat setup for you and email it across within one working day.`}
      />
    </Card>
  );
}
