import { titleCase } from '../utils/format';

// Consistent visual treatment for statuses and pipeline stages.
export function StatusBadge({ value }: { value: string }) {
  return <span className={`status status-${value}`}>{titleCase(value)}</span>;
}
