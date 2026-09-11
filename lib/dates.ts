export function startOfDay(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function normalizeDay(y: number, m: number, day: number): Date {
  return new Date(y, m - 1, day, 12, 0, 0, 0);
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${m}/${date.getFullYear()}`;
}

export function formatTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  const day = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${m}/${date.getFullYear()} ${h}:${min}`;
}

export function daysUntil(from: Date, to: Date): number {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000
  );
}

export function computeMembershipDates(
  now: Date,
  durationDays: number,
  currentEndDate?: Date | null
): { startDate: Date; endDate: Date } {
  const today = startOfDay(now);
  const base =
    currentEndDate && currentEndDate >= today ? currentEndDate : today;
  return { startDate: base, endDate: addDays(base, durationDays) };
}

export function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDuration(days: number): string {
  if (days % 365 === 0) {
    const years = days / 365;
    return years === 1 ? "1 año" : `${years} años`;
  }
  if (days % 30 === 0) {
    const months = days / 30;
    return months === 1 ? "1 mes" : `${months} meses`;
  }
  return `${days} días`;
}

export function parseExcelDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  const val = String(value).trim();
  if (val === "" || val.toLowerCase() === "n/a" || val === "-") return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return normalizeDay(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }

  const num = Number(val.replace(",", "."));
  if (!Number.isNaN(num) && /^\d+(\.\d+)?$/.test(val)) {
    if (num > 20000 && num < 60000) {
      const utc = new Date((num - 25569) * 86400000);
      return normalizeDay(
        utc.getUTCFullYear(),
        utc.getUTCMonth() + 1,
        utc.getUTCDate()
      );
    }
    return null;
  }

  const dmy = val.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmy) {
    let year = parseInt(dmy[3], 10);
    if (year < 100) year += 2000;
    return normalizeDay(year, parseInt(dmy[2], 10), parseInt(dmy[1], 10));
  }

  const ymd = val.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymd) {
    return normalizeDay(
      parseInt(ymd[1], 10),
      parseInt(ymd[2], 10),
      parseInt(ymd[3], 10)
    );
  }

  const parsed = new Date(val);
  if (!Number.isNaN(parsed.getTime())) {
    return normalizeDay(
      parsed.getFullYear(),
      parsed.getMonth() + 1,
      parsed.getDate()
    );
  }

  return null;
}

export function parseDni(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  let s = String(value).trim();
  if (s === "") return null;
  s = s.replace(/\D/g, "");
  if (s === "") return null;
  return s;
}