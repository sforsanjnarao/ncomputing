"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { formatInr } from "@/lib/format";
import type { Product, ProductType } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    setLoadError(false);
    api
      .get<{ products: Product[] }>("/products/admin")
      .then((data) => setProducts(data.products))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;

    const highlights = data.highlights
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const specifications = Object.fromEntries(
      data.specifications
        .split("\n")
        .map((line) => line.split(":").map((part) => part.trim()))
        .filter(([key, value]) => key && value),
    );

    const platforms = data.platforms
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      await api.post("/products", {
        slug: data.slug,
        name: data.name,
        type: data.type as ProductType,
        amount: Number(data.price),
        tagline: data.tagline,
        summary: data.summary,
        highlights,
        specifications,
        platforms,
        isActive: data.isActive === "on",
      });
      form.reset();
      load();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not create that product.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>

      <Card className="mt-6">
        <CardBody className="p-5">
          <h2 className="text-lg font-semibold">Add a product</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                {(props) => <Input {...props} name="name" required />}
              </Field>
              <Field label="Slug" hint="Used in the URL, e.g. rx420">
                {(props) => (
                  <Input {...props} name="slug" required pattern="[a-z0-9-]+" />
                )}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                {(props) => (
                  <Select {...props} name="type" defaultValue="HARDWARE">
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                  </Select>
                )}
              </Field>
              <Field label="Price (₹)">
                {(props) => (
                  <Input
                    {...props}
                    name="price"
                    type="number"
                    min={1}
                    step="0.01"
                    required
                  />
                )}
              </Field>
            </div>

            <Field label="Tagline">
              {(props) => <Input {...props} name="tagline" required />}
            </Field>
            <Field label="Summary">
              {(props) => (
                <Textarea {...props} name="summary" rows={3} required />
              )}
            </Field>
            <Field label="Highlights" hint="One per line">
              {(props) => <Textarea {...props} name="highlights" rows={3} />}
            </Field>
            <Field label="Specifications" hint="One per line, as Key: Value">
              {(props) => (
                <Textarea
                  {...props}
                  name="specifications"
                  rows={3}
                  placeholder="Seats: 2"
                />
              )}
            </Field>
            <Field
              label="Platforms"
              hint="One per line — shown in the products comparison table"
            >
              {(props) => (
                <Textarea
                  {...props}
                  name="platforms"
                  rows={3}
                  placeholder="Microsoft AVD"
                />
              )}
            </Field>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300"
              />
              Show on the site
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add product"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <p className="text-red-600">Could not load products.</p>
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.slug}</p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {product.type.charAt(0) +
                        product.type.slice(1).toLowerCase()}
                    </td>
                    <td className="p-4 tabular-nums">
                      {formatInr(product.amount)}
                    </td>
                    <td className="p-4">
                      <Badge tone={product.isActive ? "green" : "neutral"}>
                        {product.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
