export default function Loading() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    </div>
  );
}
