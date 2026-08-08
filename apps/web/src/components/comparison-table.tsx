import { formatInr } from "@/lib/format";
import { ASSUMPTIONS } from "@/content/pricing-assumptions";

// Numeric rows are strings built from ASSUMPTIONS (shared with
// SavingsCalculator) rather than separately hardcoded, so this table can
// never quote a different number than the calculator for the same thing.
const ROWS = [
  {
    label: "Hardware, to add 10 seats",
    traditional: `${formatInr(10 * ASSUMPTIONS.pcCost)} — 10 full PCs`,
    ncomputing: `${formatInr(
      ASSUMPTIONS.hostCost + 5 * ASSUMPTIONS.devicePrice,
    )} — 1 host + 5 RX420s`,
  },
  {
    label: "Power draw per seat",
    traditional: `${ASSUMPTIONS.pcWatts}W`,
    ncomputing: `${Math.round(
      ASSUMPTIONS.hostWatts / ASSUMPTIONS.seatsPerHost +
        ASSUMPTIONS.deviceWattsPerSeat,
    )}W — a shared host plus a few watts per device`,
  },
  {
    label: "Adding one more seat",
    traditional: "Buy, image and configure a full PC",
    ncomputing: "Plug in a thin client — minutes, until the host is full",
  },
  {
    label: "Software updates",
    traditional: "Visit every machine, or manage a fleet remotely",
    ncomputing: "Patch the host once — every seat is current immediately",
  },
  {
    label: "End of life",
    traditional: "A full PC's worth of e-waste, per seat",
    ncomputing: "One small thin client; some setups reuse an old monitor",
  },
];

export function ComparisonTable() {
  return (
    <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="p-4 font-medium text-slate-500">
              For a 10-seat room
            </th>
            <th className="p-4 font-medium text-slate-500">
              One PC per person
            </th>
            <th className="p-4 font-medium text-brand-700">
              vSpace Pro + RX420
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-slate-200">
              <td className="p-4 font-medium text-ink">{row.label}</td>
              <td className="p-4 text-slate-600">{row.traditional}</td>
              <td className="p-4 text-savings-700">{row.ncomputing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
