// Formatting helpers keep display logic consistent across tables and detail pages.
export function currency(value?: number | null) {
  if (value === undefined || value === null) return 'Not set';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
}

export function dateTime(value?: string | null) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function splitCsv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}
