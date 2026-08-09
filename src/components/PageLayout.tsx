import type { ReactNode } from "react";
import Navigation from "./Navigation";

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
    <header className="nf-page-header">
      <div className="nf-topbar">
        <div className="nf-page-heading">
          <h1>{title}</h1>
          {(titleMeta || aside) && (
            <div className="nf-page-meta">
              {titleMeta}
              {aside}
            </div>
          )}
        </div>
        <Navigation />
      </div>
      {description && <p>{description}</p>}
    </header>
  );
}
