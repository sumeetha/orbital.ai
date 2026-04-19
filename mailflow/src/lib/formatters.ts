export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

export function computeRate(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}
