import type { ReactNode } from "react";
import Navigation from "./Navigation";

export function PageHeader({
  title,
  titleMeta,
  description,
  aside,
  className,
}: {
  title: ReactNode;
  titleMeta?: ReactNode;
  description?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`nf-page-header${className ? ` ${className}` : ""}`}>
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
