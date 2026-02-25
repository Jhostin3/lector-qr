export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function maskTransactionId(id: string): string {
  if (id.length < 8) return id;
  return `****${id.slice(-8).toUpperCase()}`;
}

export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
