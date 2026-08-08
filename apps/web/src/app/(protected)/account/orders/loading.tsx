export default function Loading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
          />
        ))}
      </div>
    </div>
  );
}
