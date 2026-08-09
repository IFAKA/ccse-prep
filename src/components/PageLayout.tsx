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
    <header className="nf-page-header">
      <div>
        <h1>
          {title}
        </h1>
        {titleMeta && <div>{titleMeta}</div>}
        {description && (
          <p>
            {description}
          </p>
        )}
        {aside && <div>{aside}</div>}
      </div>
    </header>
  );
}
