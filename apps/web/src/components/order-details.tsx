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
              <p className="font-medium">{item.product.name}</p>
              {item.seats && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.seats} licence seats
                </p>
              )}
              <p className="mt-0.5 text-sm text-slate-600">
                {item.quantity} × {formatInr(item.product.amount)}
              </p>
            </div>
            <p className="shrink-0 font-medium tabular-nums">
              {formatInr(item.product.amount * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatInr(order.orderAmount)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AddressBlock({
  title,
  address,
}: {
  title: string;
  address: Address | null;
}) {
  if (!address) return null;

  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <address className="mt-1 text-sm not-italic leading-relaxed text-slate-800">
        {address.fullName}
        <br />
        {address.fullAddress}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
      </address>
    </div>
  );
}
