import type { ReactNode } from 'react';

// Common page heading with optional action buttons on the right.
export function PageHeader({ title, detail, actions }: { title: string; detail?: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}
