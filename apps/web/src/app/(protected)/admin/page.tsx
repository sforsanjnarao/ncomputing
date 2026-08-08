"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatInr } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/badge";
import { AddressBlock, OrderItemsTable } from "@/components/order-details";
import { Pagination } from "@/components/ui/pagination";

type OrdersResponse = {
  orders: Order[];
  total: number;
  pageSize: number;
  stats: { revenue: number; awaiting: number };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [stats, setStats] = useState({ revenue: 0, awaiting: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  // Filtering happens on the server so it keeps working once there are more
  // orders than one page can hold.
  const load = useCallback(async () => {
    setError(false);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    params.set("page", String(page));

    try {
      const data = await api.get<OrdersResponse>(`/orders/admin?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
      setPageSize(data.pageSize);
      setStats(data.stats);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  // Debounced so typing in the search box does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(timer);
  }, [load]);

  // A changed filter makes "page 3" meaningless — start over from page 1.
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  async function changeStatus(order: Order, next: OrderStatus) {
    const { order: updated } = await api.patch<{ order: Order }>(
      `/orders/admin/${order.id}/status`,
      {
        status: next,
      },
    );
    setOrders((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setSelected((current) => (current?.id === updated.id ? updated : current));
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Orders matching filters", String(total)],
          ["Revenue collected", formatInr(stats.revenue)],
          ["Awaiting processing", String(stats.awaiting)],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody className="p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {value}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number, customer name or email"
              className="pl-9"
              aria-label="Search orders"
            />
          </div>
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as OrderStatus | "")
            }
            className="sm:w-52"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Placed</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">&nbsp;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <p className="text-red-600">Could not load orders.</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={load}
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No orders match those filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="p-4">
                      <p>{order.user?.name}</p>
                      <p className="text-xs text-slate-500">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4 tabular-nums">
                      {formatInr(order.orderAmount)}
                    </td>
                    <td className="p-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="p-4">
                      <Select
                        value={order.status}
                        onChange={(event) =>
                          changeStatus(order, event.target.value as OrderStatus)
                        }
                        className="h-9 py-0 text-xs"
                        aria-label={`Status for ${order.orderNumber}`}
                      >
                        {ORDER_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0) + option.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelected(order)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={total}
          pageSize={pageSize}
          onChange={setPage}
        />
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.orderNumber ?? ""}
        description={
          selected ? `Placed ${formatDate(selected.createdAt)}` : undefined
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <PaymentStatusBadge status={selected.paymentStatus} />
              <OrderStatusBadge status={selected.status} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Customer</p>
              <p className="mt-1 text-sm">
                {selected.user?.name}
                <br />
                {selected.user?.email}
                {selected.user?.organization ? (
                  <>
                    <br />
                    {selected.user.organization}
                  </>
                ) : null}
              </p>
            </div>

            <OrderItemsTable order={selected} />

            <div className="grid gap-4 sm:grid-cols-2">
              <AddressBlock
                title="Shipping"
                address={selected.shippingAddress}
              />
              <AddressBlock title="Billing" address={selected.billingAddress} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
