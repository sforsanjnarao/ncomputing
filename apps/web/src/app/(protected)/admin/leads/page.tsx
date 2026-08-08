"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
  type LeadType,
  type VisitorEventType,
} from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Badge, LeadScoreBadge, LeadStatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const ACTIVITY_LABELS: Record<VisitorEventType, string> = {
  PAGE_VIEW: "page view",
  PRODUCT_VIEW: "product view",
  ADD_TO_CART: "cart add",
  CHECKOUT_STARTED: "checkout started",
  LEAD_SUBMITTED: "form submitted",
};

function formatActivity(activity: Lead["activity"]) {
  if (!activity || activity.length === 0) return "No tracked activity";
  const meaningful = activity.filter((a) => a.type !== "PAGE_VIEW");
  const shown = (meaningful.length > 0 ? meaningful : activity)
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  return shown
    .map((a) => `${a.count} ${ACTIVITY_LABELS[a.type]}${a.count > 1 ? "s" : ""}`)
    .join(", ");
}

const LEAD_TYPES: LeadType[] = ["DEMO", "SALES", "PRICING"];

const TYPE_LABELS: Record<LeadType, string> = {
  DEMO: "Demo",
  SALES: "Sales",
  PRICING: "Pricing",
};

type LeadsResponse = { leads: Lead[]; total: number; pageSize: number };

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [type, setType] = useState<LeadType | "">("");
  const [page, setPage] = useState(1);
  
  
  
  const [sortByScore, setSortByScore] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    params.set("page", String(page));

    try {
      const data = await api.get<LeadsResponse>(`/leads/admin?${params}`);
      setLeads(data.leads);
      setTotal(data.total);
      setPageSize(data.pageSize);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, page]);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(timer);
  }, [load]);

  
  useEffect(() => {
    setPage(1);
  }, [search, status, type]);

  async function changeStatus(lead: Lead, next: LeadStatus) {
    const { lead: updated } = await api.patch<{ lead: Lead }>(
      `/leads/admin/${lead.id}`,
      {
        status: next,
      },
    );
    setLeads((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  const visibleLeads = useMemo(() => {
    if (!sortByScore) return leads;
    return [...leads].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  }, [leads, sortByScore]);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>

      <Card className="mt-6">
        <CardBody className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or organization"
              className="pl-9"
              aria-label="Search leads"
            />
          </div>
          <Select
            value={type}
            onChange={(event) => setType(event.target.value as LeadType | "")}
            className="sm:w-44"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            {LEAD_TYPES.map((option) => (
              <option key={option} value={option}>
                {TYPE_LABELS[option]}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as LeadStatus | "")
            }
            className="sm:w-44"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
          <Button
            variant={sortByScore ? "primary" : "secondary"}
            size="md"
            onClick={() => setSortByScore((current) => !current)}
            className="sm:w-auto"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort by score
          </Button>
        </CardBody>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-4 font-medium">Received</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Organization</th>
                <th className="p-4 font-medium">Seats</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Interest</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <p className="text-red-600">Could not load leads.</p>
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
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No leads match those filters.
                  </td>
                </tr>
              ) : (
                visibleLeads.map((lead) => (
                  <tr key={lead.id} className="align-top hover:bg-slate-50">
                    <td className="p-4 text-slate-600">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="p-4">
                      <Badge tone="blue">{TYPE_LABELS[lead.type]}</Badge>
                      {lead.productSlug && (
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.productSlug}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                      <p className="text-xs text-slate-500">{lead.phone}</p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {lead.organization ?? "—"}
                    </td>
                    <td className="p-4 tabular-nums text-slate-600">
                      {lead.seats ?? "—"}
                    </td>
                    <td className="p-4 max-w-xs text-slate-600">
                      {lead.message ?? "—"}
                    </td>
                    <td className="p-4 max-w-[14rem]">
                      {lead.scoreLabel ? (
                        <>
                          <LeadScoreBadge label={lead.scoreLabel} />
                          <p className="mt-1 text-xs text-slate-500">
                            {formatActivity(lead.activity)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No tracked activity
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Select
                        value={lead.status}
                        onChange={(event) =>
                          changeStatus(lead, event.target.value as LeadStatus)
                        }
                        className="h-9 py-0 text-xs"
                        aria-label={`Status for ${lead.name}`}
                      >
                        {LEAD_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0) + option.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </Select>
                      <div className="mt-1">
                        <LeadStatusBadge status={lead.status} />
                      </div>
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
    </>
  );
}
