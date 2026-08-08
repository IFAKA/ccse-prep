import type { ReactNode } from "react";

export function PageHeader({
  title,
  titleMeta,
  description,
  aside,
}: {
  title: ReactNode;
  titleMeta?: ReactNode;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="page-header flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="mt-0 text-3xl font-bold tracking-[-0.035em] sm:text-5xl">
          {title}
        </h1>
        {titleMeta && <div className="mt-3">{titleMeta}</div>}
        {description && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--secondary)] sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {aside}
    </header>
  );
}

export function SectionHeading({
  children,
  description,
}: {
  children: ReactNode;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--secondary)]">
        {children}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-[var(--secondary)]">{description}</p>
      )}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--separator)] bg-[var(--surface)] shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <SurfaceCard className="p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--secondary)]">{label}</p>
      <strong className="mt-2 block text-3xl tracking-[-0.03em] tabular-nums">{value}</strong>
    </SurfaceCard>
  );
}
