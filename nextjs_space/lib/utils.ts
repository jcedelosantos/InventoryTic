import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(amount: number | null | undefined): string {
  const val = amount ?? 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getDaysUntilExpiry(date: string | Date | null | undefined): number {
  if (!date) return Infinity;
  const now = new Date();
  const expiry = new Date(date);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(days: number): { label: string; color: string } {
  if (days < 0) return { label: 'Vencida', color: 'bg-red-100 text-red-800' };
  if (days <= 30) return { label: 'Por vencer', color: 'bg-yellow-100 text-yellow-800' };
  if (days <= 90) return { label: 'Próxima', color: 'bg-orange-100 text-orange-800' };
  return { label: 'Vigente', color: 'bg-green-100 text-green-800' };
}
