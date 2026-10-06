export { cn } from "cn";

export function toBengaliNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "০";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[Number.parseInt(d, 10)] || d);
}

export function formatBengaliCount(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "০";
  const n = typeof num === "string" ? Number.parseFloat(num) || 0 : num;
  if (n < 1000) return toBengaliNumber(n);
  if (n < 1000000) {
    const k = (n / 1000).toFixed(n % 1000 === 0 || n >= 10000 ? 0 : 1);
    return `${toBengaliNumber(k)}K`;
  }
  const m = (n / 1000000).toFixed(n % 1000000 === 0 || n >= 10000000 ? 0 : 1);
  return `${toBengaliNumber(m)}M`;
}

export function formatBengaliRelativeTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "সম্প্রতি";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "সম্প্রতি";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "এইমাত্র";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${toBengaliNumber(diffMin)} মিনিট আগে`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toBengaliNumber(diffHours)} ঘণ্টা আগে`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${toBengaliNumber(diffDays)} দিন আগে`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${toBengaliNumber(diffMonths)} মাস আগে`;
  const diffYears = Math.floor(diffDays / 365);
  return `${toBengaliNumber(diffYears)} বছর আগে`;
}
