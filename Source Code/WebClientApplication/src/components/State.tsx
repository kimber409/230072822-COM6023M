// Small shared components for async states from React Query.
export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return <div className="state state-loading">{label}...</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="state state-error">{message}</div>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="state state-empty"><strong>{title}</strong><span>{detail}</span></div>;
}
