/**
 * Utility functions for Indian Financial Formatting & IST Timestamps
 */

export function formatINR(amount: number | null | undefined, showSymbol: boolean = true): string {
  if (amount === null || amount === undefined) {
    return 'Unlimited';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Format using Indian numbering system (en-IN)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(absAmount) ? 0 : 2,
  }).format(absAmount);

  const prefix = isNegative ? '-₹' : '₹';
  return showSymbol ? `${prefix}${formatted}` : `${isNegative ? '-' : ''}${formatted}`;
}

export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '0.00%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatDate(dateInput: string | Date | number): string {
  try {
    const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid date';

    // Format in Indian Standard Time (Asia/Kolkata)
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date) + ' IST';
  } catch {
    return String(dateInput);
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}
