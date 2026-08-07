import { formatInr } from "@/lib/format";
import type { Address, Order } from "@/lib/types";

/** Read-only view of an order's contents. Shared by the customer's order page
 *  and the admin dashboard, so both always show the same thing. */
export function OrderItemsTable({ order }: { order: Order }) {
  return (
    <div>
      <ul className="divide-y divide-slate-200">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3">
            <div>
              <p className="font-medium">{item.productName}</p>
              {item.selectedOptions.length > 0 && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.selectedOptions.map((option) => `${option.group}: ${option.label}`).join(" · ")}
                </p>
              )}
              <p className="mt-0.5 text-sm text-slate-600">
                {item.quantity} × {formatInr(item.unitPriceInPaise)}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums">{formatInr(item.lineTotalInPaise)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="tabular-nums">{formatInr(order.subtotalInPaise)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">GST (18%)</dt>
          <dd className="tabular-nums">{formatInr(order.taxInPaise)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatInr(order.totalInPaise)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AddressBlock({ title, address }: { title: string; address: Address }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <address className="mt-1 text-sm not-italic leading-relaxed text-slate-800">
        {address.line1}
        {address.line2 ? (
          <>
            <br />
            {address.line2}
          </>
        ) : null}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
      </address>
    </div>
  );
}
